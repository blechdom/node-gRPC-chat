
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Node gRPC-web Chat App Tutorial

## To run the example app

1.  [Install Docker][docker].

1.  [Set up your node.js development environment][npm/NodeJS] .

1.  [Install protoc][grpc].

1.  Clone this Repo.

1.  Start Docker.

1.  Build Docker Envoy Proxy

        docker build -t node-grpc-web/envoy -f ./envoy.Dockerfile .

1.  Run Envoy Proxy.

    on Mac:

        docker run -d -p 8080:8080 node-grpc-web/envoy

    on Windows/Linux:

        docker run -d -p 8080:8080 --network=host node-grpc-web/envoy

1.  Install node packages.

        npm install

1.  Build Webpack Client. Creates 'dist' folder with main.js inside.

        npm run build

1.  Start node server.

        node start

1.  Install http-server from npm.

        npm install -g http-server

1.  Run http-server (in new terminal window)

        http-server -p 8081

1.  Go to http://localhost:8081 in your browser window.

## To edit and test the example app

*   Make sure Docker and Envoy proxy are installed and running

*   Make sure you have installed your node dependencies

        npm install

*   If you edit cloud_speech_web.proto file, you will need to recompile it using protoc

        protoc -I=. cloud_speech_web.proto \ --js_out=import_style=commonjs:. \ --grpc-web_out=import_style=commonjs,mode=grpcwebtext:.

    * Protoc will generate two files
        * chat_grpc_web_pb.js
        * chat_pb.js files
    * Since client.js includes these files, you will need to recompile with Webpack

            npm run build

*   If you only edit client.js, just rebuild it with Webpack.

        npm run build

* if you edit server.js, you will need to stop and start the node server.

        ctl-c
        npm start

* If you edit anything, including index.html, don't forget to refresh browser page and clear cache

[explained]: https://cloud.google.com/apis/docs/client-libraries-explained
[docker]: https://www.docker.com/products/docker-desktop
[npm/NodeJS]: https://cloud.google.com/nodejs/docs/setup
[grpc]:  https://grpc.io/docs/quickstart/go.html
[client-docs]: https://cloud.google.com/nodejs/docs/reference/speech/latest/
[product-docs]: https://cloud.google.com/speech/docs
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=speech.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started
