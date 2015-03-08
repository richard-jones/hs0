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
            "movement" : ["Pull", "Push", "Rotation"]   # which kind of movement is it?
            "main_muscles" : ["Quads", "Glutes"], # Which main muscles/groups does this exercise hit
            "targeted_muscles" : ["Inner Bicep", "Outer Bicep"], # which specific muscles in the group does this exercise hit
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
            "speed" : true|false,            # track the speed of an exercise
            "distance" : true|false,         # track the distance of an exercise

            "hr" : true|false,               # track heart rate
            "cal" : true|false,              # track calories burned

            "resisted" : true|false,         # does this exercise have some other form of resistance (e.g. cardio machine level)
            "resistance_settings" : {         # if resisted=true, offer the user these options
                "upper" : <upper bound for resistance>,
                "increment" : <smallest incremental unit>,
            },

            "incline" : true|false,          # track incline
            "incline_settings" : {           # if incline=true, offer the user these options
                "upper" : <upper bound for incline>,
                "increment" : <smallest incremental unit>,
                "unit" : "degrees|pc"
            }
        },

        "index" : {                         # fields used to make searching/indexing easier
            "name" : ["<name or aka">]
        }
    }
    """
    SCHEMA = {
        "fields" : [
            "id", "created_date", "last_updated"
        ],
        "objects" : ["info", "admin", "track", "index"],
        "object_entries" : {
            "info" : {
                "fields" : [
                    "name", "description"
                ],
                "lists" : ["aka", "classes", "movement", "main_muscles", "targeted_muscles"]
            },
            "admin" : {
                "fields" : ["owner"],
                "bools" : ["canon"]
            },
            "track" : {
                "bools" : [
                    "weight", "reps", "tempo", "assist", "time", "speed", "distance", "resisted", "incline", "hr", "cal"
                ],
                "objects" : ["resistance_settings", "incline_settings"],
                "object_entries" : {
                    "resistance_settings" : {
                        "fields" : ["upper", "increment"]
                    },
                    "incline_settings" : {
                        "fields" : ["upper", "increment", "unit"]
                    }
                }
            },
            "index" : {
                "lists" : ["name"]
            }
        }
    }

    @property
    def name(self):
        return self._get_single("info.name", self._utf8_unicode())

    @property
    def aka(self):
        return self._get_list("info.aka", self._utf8_unicode())

    @property
    def weight(self):
        return self._get_single("track.weight", default=False, coerce=bool)

    @property
    def reps(self):
        return self._get_single("track.reps", default=False, coerce=bool)

    @property
    def tempo(self):
        return self._get_single("track.tempo", default=False, coerce=bool)

    @property
    def assist(self):
        return self._get_single("track.assist", default=False, coerce=bool)

    @property
    def time(self):
        return self._get_single("track.time", default=False, coerce=bool)

    @property
    def speed(self):
        return self._get_single("track.speed", default=False, coerce=bool)

    @property
    def distance(self):
        return self._get_single("track.distance", default=False, coerce=bool)

    @property
    def hr(self):
        return self._get_single("track.hr", default=False, coerce=bool)

    @property
    def cal(self):
        return self._get_single("track.cal", default=False, coerce=bool)

    @property
    def resisted(self):
        return self._get_single("track.resisted", default=False, coerce=bool)

    @property
    def incline(self):
        return self._get_single("track.incline", default=False, coerce=bool)

    @property
    def incline_unit(self):
        return self._get_single("track.incline_settings.unit", coerce=self._utf8_unicode())

    @property
    def indexed_name(self):
        return self._get_list("index.name", self._utf8_unicode())

    @indexed_name.setter
    def indexed_name(self, val):
        self._set_list("index.name", val, self._utf8_unicode())

    def resistance_levels(self):
        lower = 0.0
        upper = self._get_single("track.resistance_settings.upper", coerce=self._int())
        increment = self._get_single("track.resistance_settings.increment", coerce=self._float())
        intify = False
        if int(increment) == increment:
            intify = True
        v = lower
        while v <= upper:
            if intify:
                yield int(v)
            else:
                yield v
            v += increment

    def incline_levels(self):
        lower = 0.0
        upper = self._get_single("track.incline_settings.upper", coerce=self._int())
        increment = self._get_single("track.incline_settings.increment", coerce=self._float())
        intify = False
        if int(increment) == increment:
            intify = True
        v = lower
        while v <= upper:
            if intify:
                yield int(v)
            else:
                yield v
            v += increment

    def prep(self):
        super(Exercise, self).prep()
        n = self.name
        a = self.aka
        self.indexed_name = [n] + a


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
