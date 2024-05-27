# Instructions

To generate the services and models from `*.proto` files just run in your terminal with your venv activated:

```shell
$ cd ${REPO_ROOT}/protos/services

$ python -m grpc_tools.protoc -I ../ --python_out=. --pyi_out=. --grpc_python_out=. ../helloworld.proto
```

# https://grpc.io/docs/languages/python/quickstart/