import multiprocessing

bind = "127.0.0.1:8000"
workers = multiprocessing.cpu_count() * 2 + 1
accesslog = "/var/log/barilo-rest-api/gunicorn_access.log"
errorlog = "/var/log/barilo-rest-api/gunicorn_error.log"
loglevel = "info"
timeout = 120
graceful_timeout = 30
keepalive = 2

# Optional: customize the worker class
worker_class = "sync"  # You can use 'gevent' or 'eventlet' for async support

# Optional: if you're using a proxy like Nginx
forwarded_allow_ips = "*"
