import configparser

def get_db_config():
    config = configparser.ConfigParser()
    config.read('config.ini')
    db_params = config['postgresql']
    return {
        'host': db_params.get('host'),
        'port': db_params.get('port'),
        'database': db_params.get('database'),
        'user': db_params.get('user'),
        'password': db_params.get('password')
    }

def get_secret_key():
    config = configparser.ConfigParser()
    config.read('config.ini')
    flask_config = config['flask']
    return flask_config.get('secret_key')
