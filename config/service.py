# overrides for the webapp deployment
DEBUG = True
PORT = 5020
SSL = False
THREADED = True

# important overrides for the ES module

# elasticsearch back-end connection settings
ELASTIC_SEARCH_HOST = "http://localhost:9200"
ELASTIC_SEARCH_INDEX = "hs0"

# Classes from which to retrieve ES mappings to be used in this application
ELASTIC_SEARCH_MAPPINGS = [
    "service.exercise.ExerciseDAO"
]

CRUD = {
    "exercise" : {
        "model" : "service.exercise.CRUDExercise",
        "create" : {
            "enable" : True
        },
        "retrieve" : {
            "enable" : True
        },
        "update" : {
            "enable" : True
        },
        "delete" : {
            "enable" : False
        }
    }
}

FRAGMENTS = {
    "exercise-form" : {
        "template" : "_exercise_form.html"
    },
    "exercise-result" : {
        "template" : "_exercise_result.html"
    }
}

QUERY_ROUTE = {
    "query" : {                                 # the URL route at which it is mounted
        "exercise" : {                             # the URL name for the index type being queried
            "auth" : False,                     # whether the route requires authentication
            "role" : None,                      # if authenticated, what role is required to access the query endpoint
            "filters" : [],                     # names of the standard filters to apply to the query
            "dao" : "service.exercise.ExerciseDAO"       # classpath for DAO which accesses the underlying ES index
        }
    }
}

CLIENTJS_EXERCISE_ENDPOINT = "/query/exercise"

CLIENTJS_SET_PREVIEW_ENDPOINT = "/set"