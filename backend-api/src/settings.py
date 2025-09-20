import os
from decouple import Config, RepositoryEnv

ENV = os.getenv("ENV", "dev")
ENV_FILE = f".env.{ENV}"

if os.path.exists(ENV_FILE):
    config = Config(RepositoryEnv(ENV_FILE))
else:
    from decouple import config as config_default
    config = config_default

DATABASE_URL = config("DATABASE_URL")
IS_PROD_MODE   = config("IS_PROD_MODE")

if __name__ == "__main__":
    print("IS_PROD_MODE =", IS_PROD_MODE)