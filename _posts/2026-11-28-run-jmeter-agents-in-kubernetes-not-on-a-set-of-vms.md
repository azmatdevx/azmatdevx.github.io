---
layout: post
title: "Run JMeter agents in Kubernetes, not on a set of VMs"
description: "A fleet of JMeter agents as Kubernetes pods is easier to scale, reset and keep identical than a set of VMs. Tried locally with kind and kubectl."
date: 2026-11-28 03:21:41 +0400
author: azmat
tags: [Performance, Load Testing, Kubernetes]
image: '/images/jmeter-k8s.webp'
featured: false
toc: true
---

When one machine cannot generate enough load, JMeter's answer is distributed mode: a controller sends the test plan to several agents (also called workers or servers), and each runs it. The usual way to get agents is a set of VMs with JMeter installed. I think a fleet of pods in Kubernetes is the better way, and I tried it locally with kind and kubectl.

### What goes wrong with a set of VMs

A VM with JMeter on it starts as a clean machine and slowly becomes a pet:

- **Drift.** One agent has a different Java version, a plugin the others lack, or an edited `jmeter.properties`. Results differ and nobody knows why.
- **Leftover state.** Old CSV data, logs and JTL files stay on the disk between runs, so a run is never quite from a clean start.
- **Slow scaling.** Going from 4 agents to 10 means provisioning six more machines and keeping them up to date. Going back down means remembering to turn them off.
- **Idle cost.** The VMs sit there between test runs, either paid for or stopped by hand.
- **Uneven agents.** The VMs often differ in size, so the slowest one sets how much load you can trust.

### What Kubernetes changes

- **One image, identical agents.** JMeter, Java, plugins and properties are baked into one container image. Every agent is the same by construction.
- **Scale with one number.** The agent count is the `replicas` field of a Deployment, or a StatefulSet if you want stable names. `kubectl scale` changes it in seconds.
- **Clean on every run.** Delete the pods and you get fresh ones. Nothing carries over.
- **Equal, limited agents.** Every pod gets the same CPU and memory requests and limits, so you know what each agent can do.
- **Built-in discovery.** A headless Service gives the controller a DNS name that resolves to every agent pod, so you do not keep a hand-written list of IP addresses.
- **Cleanup is one command.** `kubectl delete` removes the whole fleet, and nothing keeps costing money.

### The local setup

I ran this on my laptop with [kind](https://kind.sigs.k8s.io/), which runs Kubernetes inside Docker, and `kubectl`. No cloud account is needed. I used 6 JMeter agents.

```bash
kind create cluster --name jmeter
kubectl create namespace load
```

The agents are a Deployment running JMeter in server mode, plus a headless Service. The image name is a placeholder for an image you build with JMeter and your plugins:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jmeter-agent
  namespace: load
spec:
  replicas: 6
  selector:
    matchLabels: { app: jmeter-agent }
  template:
    metadata:
      labels: { app: jmeter-agent }
    spec:
      containers:
        - name: jmeter
          image: your-jmeter-image:5.6.3   # build and load this yourself
          command: ["jmeter-server"]
          args:
            - -Dserver.rmi.ssl.disable=true   # local lab only
            - -Djava.rmi.server.hostname=$(POD_IP)
          env:
            - name: POD_IP
              valueFrom: { fieldRef: { fieldPath: status.podIP } }
          ports:
            - containerPort: 1099
          resources:
            requests: { cpu: "500m", memory: 1Gi }
            limits:   { cpu: "1",    memory: 1Gi }
---
apiVersion: v1
kind: Service
metadata:
  name: jmeter-agent
  namespace: load
spec:
  clusterIP: None
  selector: { app: jmeter-agent }
  ports:
    - port: 1099
```

Load the image into kind with `kind load docker-image your-jmeter-image:5.6.3 --name jmeter`, apply the file and watch the 6 pods come up. To change the count later, scale the Deployment:

```bash
kubectl apply -f jmeter-agents.yaml
kubectl -n load get pods -o wide

# later, to change the agent count
kubectl -n load scale deployment/jmeter-agent --replicas=10
```

To run a test, start the controller from a pod in the same namespace and give it the agent addresses with `-R`. You can list the pod IPs with:

```bash
kubectl -n load get pods -l app=jmeter-agent \
  -o jsonpath='{range .items[*]}{.status.podIP}{","}{end}'
```

### What I found

I ran 6 agents as pods in a kind cluster running in Docker. They spun up pretty fast, driven by an execution service built in .NET 10. The service:

- creates the agent pods from the JMeter image,
- makes sure the test runs inside those pods,
- streams the results back, including the log files and the JTL files,
- and makes sure the results are ingested into InfluxDB as well.

The VMs I compared against were already provisioned and sat idle until the next run. The pods are different: the service creates them on the fly, as many as a specific test needs, and tears them down when the test is done. Nothing sits idle between runs, and the agent count follows the test instead of the size of a fixed pool.

### Things to keep in mind

- **kind is a laptop.** All the "nodes" share one machine, so a kind run shows that the setup works, not how much load a real cluster can generate. Check agent CPU in a real cluster before you trust throughput numbers.
- **JMeter's RMI is picky.** Distributed mode uses RMI, which is sensitive to hostnames and ports, and the agents need to reach the controller back. The SSL-off flag above is for a local lab only. Do not use it on a shared network.
- **Pods need headroom.** If a pod's CPU limit is too tight, the agent becomes the bottleneck and you measure the load generator instead of the system under test.
- **VMs are still fine for some cases.** If you already have a stable pool of well-managed machines, or you need a specific network position, VMs can make sense. The point is that a fleet you can recreate on demand beats one you have to maintain.

### What I would do now

Treat load agents as disposable. Build one image, run it as a fleet, scale with one command, and delete it when the test is done. The agents are the least interesting part of a load test, so they should be the cheapest to run.
