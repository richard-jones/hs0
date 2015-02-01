from octopus.core import app

from octopus.lib import dataobj
from octopus.modules.crud.models import ES_CRUD_Wrapper_Ultra
from octopus.modules.es import dao
from octopus.modules.form.validate import DataOptional
from octopus.modules.form.context import FormContext, Renderer

from wtforms import Form, StringField, TextAreaField, DateField, FloatField, SelectField, validators, FieldList, FormField, SelectMultipleField, BooleanField

# DAO
######################################################

class ExerciseDAO(dao.ESDAO):
    __type__ = 'exercise'

# Model Definition
######################################################

class Exercise(dataobj.DataObj, ExerciseDAO):
    """
    {
        "id" : "<unique id for the exercise>",
        "created_date" : "<date record was created>",
        "last_updated" : "<date record was last modified>",

        "info" : {
            "name" : "<canonical name for this exercise>",
            "aka" : ["<alternate names for this exercise>"],
            "description" : "<description of this exercise>",
            "classes": ["Cardio", "Legs"],   # What exercise classes does this belong to
            "muscles" : ["Quads", "Glutes"], # Which muscles does this exercise hit
        },

        "admin" : {
            "owner" : "userid",              # who "owns" the exercies (could be made by a specific user)
            "canon" : true|false             # is this exercise in the "canonical" exercise database
        },

        "track" : {
            # typical weight-lifting exercise
            "weight": true|false,            # track weight lifted
            "reps": true|false,              # track number of reps done
            "tempo": true|false,             # track the tempo (negative, hold, movement)

            # additional criterial for bodyweight-type exercises
            "assist" : true|false,           # track exercise assitance (e.g. counter-weight for pull-ups)

            # typical cardio exercise
            "time": true|false,              # track time for exercise

            "resisted" : true|false,         # does this exercise have some other form of resistance (e.g. cardio machine level)
            "resistance_levels" : [          # if resisted=true, offer the user these options
                {"name" : "<name of resistance level>", "value" : "<value to store>"}
            ]

            "pace" : true|false,             # track the pace of the exercies
            "pace_units" : "rpm|mph|kph"     # what units to track pace with

            "incline" : true|false,          # track incline
            "incline_units" : "deg"          # units to track incline

            "hr" : true|false,               # track heart rate
            "cal" : true|false               # track calories burned
        }
    }
    """
    SCHEMA = {
        "fields" : [
            "id", "created_date", "last_updated"
        ],
        "objects" : ["info", "admin", "track"],
        "object_entries" : {
            "info" : {
                "fields" : [
                    "name", "description"
                ],
                "lists" : ["aka", "classes", "muscles"]
            },
            "admin" : {
                "fields" : ["owner"],
                "bools" : ["canon"]
            },
            "track" : {
                "bools" : [
                    "weight", "reps", "tempo", "assist", "time", "resisted", "pace", "pace_units" "incline", "incline_units", "hr", "cal"
                ],
                "lists" : ["resistance_levels"],
                "list_entries" : {
                    "resistance_levels" : {
                        "fields" : ["name", "value"]
                    }
                }
            }
        }
    }

# CRUD interface
######################################################

class CRUDExercise(ES_CRUD_Wrapper_Ultra):
    INNER_TYPE = Exercise

    def __init__(self, raw=None):
        if raw is not None:
            # FIXME: whether you can set these or not will depend on user class
            """
            if "owner" in raw.get("info", {}):
                del raw["info"]["owner"]
            if "canon" in raw.get("info", {}):
                del raw["info"]["canon"]
            """
            pass

        super(CRUDExercise, self).__init__(raw)

# Form Reprepsentation
######################################################

PACE_CHOICES = [
    ("RPM", "rpm"), ("MPH", "mph"), ("KmPH", "kmph")
]

INCLINE_CHOICES = [
    ("Degrees", "deg")
]

class Admin(Form):
    # administrative exercise data
    owner = StringField("Owner (Admin Only)", [validators.DataRequired()])
    canon = BooleanField("Part of the HS0 Canon?", [DataOptional()])

class ResistanceLevels(Form):
    name = StringField("Name of level")
    value = StringField("Value to store")

class Description(Form):
    # basic metadata about the exercise
    name = StringField("Exercise Name", [validators.DataRequired()])
    aka = FieldList(StringField("AKA", [DataOptional()]))
    description = TextAreaField("Description", [DataOptional()])
    classes = SelectMultipleField("Excercise Type", [validators.DataRequired()], choices=[])
    muscles = SelectMultipleField("Muscles Worked", [validators.DataRequired()], choices=[])

    # which aspects of the exercise to track
    weight = BooleanField("Track Weight?")
    reps = BooleanField("Track Reps?")
    tempo = BooleanField("Track Tempo?")
    assist = BooleanField("Track Weight?")

    time = BooleanField("Track Time?")
    resisted = BooleanField("Track Resistance (cardio)?")
    pace = BooleanField("Track Pace?")
    incline = BooleanField("Track Incline?")
    hr = BooleanField("Track Heart Rate?")
    cal = BooleanField("Track Calories?")

    # Detailed inputs
    pace_units = SelectField("Pace Units", choices=PACE_CHOICES)
    incline_units = SelectField("Incline Units", choices=INCLINE_CHOICES)
    resistance_levels = FieldList(FormField(ResistanceLevels))

class Controls(Form):
    cardio = BooleanField("Cardio?")
    weights = BooleanField("Weights?")
    bodyweight = BooleanField("Bodyweight?")

class PublicExerciseForm(Description, Controls):
    pass

class AdminExerciseForm(Admin, Description, Controls):
    pass

# The form context
#################################################################################################

class PublicFormContext(FormContext):
    def make_renderer(self):
        self.renderer = ExerciseRenderer()

    def set_template(self):
        self.template = "exercise.html"

    def pre_validate(self):
        pass

    def blank_form(self):
        self.form = PublicExerciseForm()

    def data2form(self):
        self.form = PublicExerciseForm(formdata=self.form_data)

    def source2form(self):
        pass

    def form2target(self):
        pass

    def patch_target(self):
        pass

class ExerciseRenderer(Renderer):
    def __init__(self):
        super(ExerciseRenderer, self).__init__()

        self.FIELD_GROUPS = {
            "info" : {
                "helper" : "bs3_horizontal",
                "wrappers" : [],
                "label_width" : 4,
                "control_width" : 8,
                "fields" : [
                    {"name" : {"attributes" : {"data-parsley-required" : "true"}}},
                    {"aka" : {}},
                    {"description" : {}},
                    {"classes" : {}},
                    {"muscles" : {}}
                ]
            },
            "controls" : {
                "helper" : "bs3_horizontal",
                "wrappers" : [],
                "label_width" : 4,
                "control_width" : 8,
                "fields" : [
                    {"cardio" : {}},
                    {"weights" : {}},
                    {"bodyweight" : {}}
                ]
            },
            "weights" : {
                "helper" : "bs3_horizontal",
                "wrappers" : [],
                "label_width" : 4,
                "control_width" : 8,
                "fields" : [
                    {"weight" : {}},
                    {"reps" : {}},
                    {"tempo" : {}},
                    {"assist" : {}}
                ]
            },
            "cardio_simple" : {
                "helper" : "bs3_horizontal",
                "wrappers" : [],
                "label_width" : 4,
                "control_width" : 8,
                "fields" : [
                    {"time" : {}},
                    {"hr" : {}},
                    {"cal" : {}}
                ]
            },
            "cardio_complex" : {
                "helper" : "bs3_horizontal",
                "wrappers" : [],
                "label_width" : 4,
                "control_width" : 8,
                "fields" : [
                    {"pace" : {}},
                    {"pace_units" : {}},
                    {"incline" : {}},
                    {"incline_units" : {}},
                    {"resisted" : {}},
                    {"resistance_levels" : {}},
                ]
            }
        }