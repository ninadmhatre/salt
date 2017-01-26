from flask import Flask, session, request, redirect, url_for, g, render_template, abort, jsonify, send_file
from tinydb import TinyDB, where, Query

# Core
import os
import pdb
 
# Flask
#from flask import Flask, render_template, g, request, abort
# from flask_debugtoolbar import DebugToolbarExtension
# from flask_login import LoginManager, login_required, current_user
# from flask.ext.cache import Cache
# from flask_seasurf import SeaSurf
# from flask_wtf.csrf import CsrfProtect

# App
# from web.wlib.Logger import AppLogger, LoggerTypes
# from web.wlib.DataAccessLayer import DAL
# from web.wlib.ObjCache import MCache
# from web.wlib.FileCache import FileCache
# from web.wlib.AuthUser import User

# Import custom Jinja2 filters
# import web.jinja2_filters
# from web.model.Shared import get_shared

# <base> ->
#      |-> <root>

__root = os.path.abspath(os.path.dirname(__file__))
__base = os.path.abspath(os.path.join(__root, '..'))

FOLDER_PATH = {
    'base': __base,
    'root': __root,
    'static': os.path.join(__root, 'static'),
    'locale': os.path.join(__base, 'locale'),
    'instance': os.path.join(__root, 'instance'),
    'resume_theme': os.path.join(__root, 'templates', 'output'),
    'tmp': os.path.join(__base, 'tmp'),
    'bin': os.path.join(__base, 'bin'),
}

# pdb.set_trace()
app = Flask(__name__, instance_path=FOLDER_PATH['instance'], static_path=FOLDER_PATH['static'],
            static_url_path='/static')

app.config.from_object('instance.global')
app.config.update(dict(FOLDER_PATH=FOLDER_PATH))

app.config['TICKET_ISSUE_PREFIX'] = 'ISSUE'
app.config['TICKET_STORY_PREFIX'] = 'STORY'

# custom_logger = AppLogger(app.config['LOGGER'])
# app.logger.addHandler(custom_logger.get_log_handler(LoggerTypes.File))

# Initialize Other Modules
# Modules which requires instance of 'app' to be created first!
# from web.model.StaticAssets import StaticFiles

# static_file = StaticFiles(app)

app.jinja_env.add_extension('jinja2.ext.loopcontrols')


@app.route('/')
def index():
    data = {}
    for k, v in app.config.items():
        data[k] = str(v)

    return jsonify(data)

@app.route('/load/<string:component>/<string:file>')
def load(component, file):
    _file = os.path.join(FOLDER_PATH['static'], component, file)
    if os.path.isfile(_file):
        return send_file(_file)

@app.route('/sample')
def sample():
    return render_template('tkt.html')

# Add Blueprint
from tkt import api

app.register_blueprint(api)

if __name__ == '__main__':
    app.run(port=14000, debug=True)
