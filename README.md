# docker-webhooks
Predefined `docker exec` using HTTP-POST for Gitlab/Github Webhooks

## Install

* Make sure the app can read/write to `DOCKER_HOST` (default: `/var/run/docker.sock`)

```shell
npm install docker-webhooks
cd docker-webhooks
sudo node app.js
```

## Configuration

Create YAML files in `/tokens`

```yaml
# Container Name or ID
container: mywebapp

# Secret token
token: ahMo3zoh0ahmei5xeCo9jebae2gooz

# Tasks to execute
tasks:
  # Name to identify this task
  - name: Update Frontend
    # Print stdout from docker exec
    showStdout: true

    # Some conditions checked against the HTTP-Body JSON
    conditions:
      - ref: "refs/heads/master"

    # Commands to execute, use docker CMD syntax
    exec:
      - ["/bin/git", "pull"]
      - ["/bin/npm", "install"]
      - gulp

  - name: Another Task
    exec:
      - ["echo", "i am another task without conditions"]
```


## Authors
* Christoph Wiechert



## License
  [MIT](LICENSE)