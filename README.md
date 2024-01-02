# **Metriport Full-Stack Demo App**

## **Description**

This repo serves as an example full-stack web-app that implements the [Metriport API](https://metriport.com/) to access and manage user health and medical data.

If you don't have an app built for your use-case, just fork the repo and use this project as a skeleton to get started building your digital health app.

If you're already working off of a mature codebase, feel free to use the relavant bits and pieces of code in this example app in your own project!

## **Architecture & Overview**

Below is an overview of the high-level components that make up this project:

![Metriport Demo App Architecture Diagram](assets/DemoAppArchitecture.png?raw=true "Architecture Diagram")

### General Components

Across the stack, DNS + HTTPS is handled using `Route 53`, and authentication + authorization is handled using `Cognito`.

### Web App Components

This is the front-end portion of the project, located under `/web-app`:

- Built using `React`.
- Source code is located in `/web-app/app`.
- Infra & deployment code uses `AWS CDK`, and is located in `/web-app/infrastructure`.
- After deployment, the app is stored in an `S3` bucket and distributed via `CloudFront`.

### Server Components

This is the back-end portion of the project, located under `/server`:

- Built using `Node.js` + `Express`.
- Source code is located in `/server/app`.
- Infra & deployment code also uses `AWS CDK`, and is located in `/server/infrastructure`.
- The deployment handled as follows:
  - Docker image is built off of the `/server/app` source code. This is what talks to the `RDS` database, and the `Metriport API`.
  - The image is deployed to the `ECR` (elastic container registry).
  - The image is used by `ECS` (elastic container service) + `Fargate` to scale server container instances to meet application load.
  - Traffic is distributed among the server instances using an `ALB` (application load balancer).

## **Prerequisites**

Before getting started with the deployment or any development, ensure you have done the following:

1. Install the prerequisite programs:
   - [The latest LTS Node.js version](https://nodejs.org/en/download/).
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/).
   - (Optional) [VS Code](https://code.visualstudio.com/) - recommended IDE.
   - (Optional) [Chrome](https://www.google.com/chrome/) - recommended browser for local dev.
   - (Optional) [DBeaver](https://dbeaver.io/) - recommended universal DB tool.
2. Create an AWS account.
3. Create an [AWS IAM admin user](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html).
4. Setup AWS `Route 53` to [handle the DNS for your domain](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/migrate-dns-domain-inactive.html) (for the last step, you can follow [this guide](https://www.namecheap.com/support/knowledgebase/article.aspx/10371/2208/how-do-i-link-my-domain-to-amazon-web-services/) if you're using Namecheap).
5. Follow modules 1 & 2 of [this guide](https://aws.amazon.com/getting-started/guides/setup-cdk/) for `Typescript` to bootstrap the `AWS CDK` on your local machine.
6. Setup a Metriport developer account on the [dev dashboard](https://dash.metriport.com/), and generate yourself an API key.

## **Self-Hosted Deployments**

### **Environment Setup**

Before starting deployments, you'll need to create and configure a deployment config file: `/infra/config/production.ts`. You can see `example.ts` in the same directory for a sample of what the end result should look like. Optionally, you can setup config files for `staging` deployments, based on your environment needs. Then, proceed with the deployment steps below.

### **Deployment Steps**

1. First, deploy the secrets stack. This will setup the secret keys required to run the server using AWS Secrets Manager. To deploy it, run the following commands (with your desired environment, in this example `production`, and `<config.stackName>` replaced with what you've set in your config file):

```shell
$ ./deploy.sh -e "production" -s "<config.secretsStackName>"
```

2. After the previous steps are done, define the `METRIPORT_API_KEY` secret using your Metriport API Secret Key by navigating to the Secrets Manager in the AWS console.

3. Then, to deploy the back-end execute the following command:

```shell
$ ./deploy.sh -e "production" -s "<config.stackName>"
```

After deployment, the backend will be available at the configured subdomain + domain.

4. Using the CDK outputs in the previous step as reference, you'll need to define local configuration file overrides for each of your environments using the `.env` files in `/web-app/app` as templates. For example if you're using a production environment, you'll want to create `/web-app/app/.env.production.local`.

5. Finally, once your config file(s) are defined, to self-host the web app front end run the following:

```shell
$ ./deploy.sh -e "production" -s "<config.webApp.stackName>"
```

Note: if you need help with the `deploy.sh` script at any time, you can run:

```shell
$ ./deploy.sh -h
```

6. On the Metriport Developer Dashboard, setup your webhook URL based on the backend URL you just deployed, pointing to the `/webhook` endpoint. For example `https://api.myapp.com/webhook`. You can [read more info about this in our dev docs](https://docs.metriport.com/more-info/webhooks). After the webhook URL is setup, configure your webhook key in the AWS Secrets Manager.

7. Redeploy the backend so it picks up the new secret value by running the following command (you can get the cluster/service name by navigating to ECS in the AWS Console):

```shell
$  aws ecs update-service --cluster [ECS_CLUSTER_NAME] --service [ECS_SERVICE_NAME] --force-new-deployment --region [config.region]
```

That's it, you're good to go! 🎉🎉🎉

## **Local Development**

### Server

---

First, create a local environment file, to define your Metriport developer API key:

```shell
$ touch server/app/.env
$ echo "METRIPORT_API_KEY=<YOUR-API-KEY>" >> server/app/.env
$ echo "METRIPORT_WEBHOOK_KEY=<YOUR-WEBHOOK-KEY>" >> server/app/.env
$ echo "METRIPORT_API_URL=https://api.metriport.com" >> server/app/.env
```

Then to run the full back-end, use docker-compose to lauch a Postgres container, as well as the Node server:

```shell
$ cd server/app
$ npm install # only needs to be run once
$ docker-compose -f docker-compose.dev.yml up --build # db is on port 5434 and server is on port 8087
```

To kill and clean-up the back-end, you can run the following from the `server/app` directory:

```shell
$ docker-compose -f docker-compose.dev.yml down
```

To debug the backend, you can attach a debugger to the running Docker container by launching the `Docker: Attach to Node` configuration in VS Code. Note that this will support hot reloads 🔥🔥!

### Web App

---

To run the front-end, execute the following commands:

```shell
$ cd web-app/app
$ npm install # only needs to be run once
$ npm run start # app runs on port 3003 by default
```

## License

Distributed under the AGPLv3 License. See `LICENSE` for more information.

Copyright © Metriport 2023-present
