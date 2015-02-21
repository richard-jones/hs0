# Installation 

Clone the project:

    git clone https://github.com/richard-jones/hs0.git

get all the submodules

    cd myapp
    git submodule init
    git submodule update

This will initialise and clone the esprit and magnificent octopus libraries

Then get the submodules for Magnificent Octopus

    cd myapp/magnificent-octopus
    git submodule init
    git submodule update

Change the origin url, so you can push code to your own repo:

    git remote set-url origin <git url of new repo home>
    git push -u origin master

Create your virtualenv and activate it

    virtualenv /path/to/venv
    source /path/tovenv/bin/activate

Install esprit and magnificent octopus (in that order)

    cd myapp/esprit
    pip install -e .
    
    cd myapp/magnificent-octopus
    pip install -e .
    
Create your local config

    cd myapp
    touch local.cfg

Then you can override any config values that you need to

To start your application, you'll also need to install it into the virtualenv just this first time

    cd myapp
    pip install -e .

Then, start your app with

    python service/web.py

# Data Model

## Exercise

```json
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
        "resistance_levels" : [          # if resisted=true, offer the user these options
            {"name" : "<name of resistance level>", "value" : "<value to store>"}
        ],
        
        "incline" : true|false,          # track incline
        "incline_settings" : {           # if incline=true, offer the user these options
            "lower" : <lower bound for incline>,
            "upper" : <upper bound for incline>,
            "increment" : <smallest incremental unit>,
            "unit" : "degrees|pc"
        }
    }
}
```