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

