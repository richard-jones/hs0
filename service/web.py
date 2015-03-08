from octopus.core import app, initialise, add_configuration
from service.exercise import Exercise
from flask import request
import json

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--debug", action="store_true", help="pycharm debug support enable")
    parser.add_argument("-c", "--config", help="additional configuration to load (e.g. for testing)")
    args = parser.parse_args()

    if args.config:
        add_configuration(app, args.config)

    pycharm_debug = app.config.get('DEBUG_PYCHARM', False)
    if args.debug:
        pycharm_debug = True

    if pycharm_debug:
        app.config['DEBUG'] = False
        import pydevd
        pydevd.settrace(app.config.get('DEBUG_SERVER_HOST', 'localhost'), port=app.config.get('DEBUG_SERVER_PORT', 51234), stdoutToServer=True, stderrToServer=True)
        print "STARTED IN REMOTE DEBUG MODE"


from flask import render_template, make_response
from octopus.lib.webapp import custom_static, jsonp

@app.route("/")
def root():
    return render_template("index.html")

@app.route("/exercise")
@app.route("/exercise/<exercise_id>")
def exercise(exercise_id=None):
    return render_template("exercise.html", exercise_id=exercise_id)

@app.route("/exercise/<exercise_id>/set")
def exercise_set(exercise_id):
    e = Exercise.pull(exercise_id)
    return render_template("_track_set.html", exercise=e)

@app.route("/exercises")
def exercises():
    return render_template("exercises.html")

@app.route("/set", methods=["GET", "POST"])
@app.route("/set/<exercise_id>")
def trackset(exercise_id=None):
    if exercise_id is not None:
        e = Exercise.pull(exercise_id)
        return render_template("set.html", exercise=e)
    else:
        if request.method == "GET":
            return render_template("set.html")
        elif request.method == "POST":
            data = json.loads(request.data)
            e = Exercise(data)
            return render_template("_track_set.html", exercise=e)


# this allows us to override the standard static file handling with our own dynamic version
@app.route("/static/<path:filename>")
def static(filename):
    return custom_static(filename)

# this allows us to serve our standard javascript config
from octopus.modules.clientjs.configjs import blueprint as configjs
app.register_blueprint(configjs)

# Autocomplete endpoint
from octopus.modules.es.autocomplete import blueprint as autocomplete
app.register_blueprint(autocomplete, url_prefix='/autocomplete')

from octopus.modules.crud.api import blueprint as crud
app.register_blueprint(crud, url_prefix="/api")

from octopus.modules.es.query import blueprint as query
app.register_blueprint(query, url_prefix="/query")

from octopus.modules.clientjs.fragments import blueprint as fragments
app.register_blueprint(fragments, url_prefix="/frag")

@app.errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404


if __name__ == "__main__":
    initialise()
    app.run(host='0.0.0.0', debug=app.config['DEBUG'], port=app.config['PORT'], threaded=False)

