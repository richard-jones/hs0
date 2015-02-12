jQuery(document).ready(function($) {
    $.extend(octopus, {
        page : {},
        service: {
            newExercise : function(params) {
                var schema = {
                    id : {type : "single", path : "id", coerce: String },
                    created_date : {type : "single", path : "created_date", coerce: String},
                    last_updated : {type : "single", path : "last_updated", coerce: String},

                    name : { type : "single", path : "info.name", coerce : String},
                    aka : {type : "list", path : "info.aka", coerce : String},
                    description : { type : "single", path : "info.description", coerce : String },
                    classes : { type : "list", path : "info.classes", coerce: String },
                    muscles : { type : "list", path : "info.muscles", coerce: String},
                    owner : { type: "single", path : "admin.owner", coerce: String },
                    canon : { type: "single", path : "admin.canon", coerce: Boolean },
                    weight : { type: "single", path : "track.weight", coerce: Boolean },
                    reps : { type: "single", path : "track.reps", coerce: Boolean },
                    tempo : { type: "single", path : "track.tempo", coerce: Boolean },
                    assist : { type: "single", path : "track.assist", coerce: Boolean },
                    time : { type: "single", path : "track.time", coerce: Boolean },
                    resisted : { type: "single", path : "track.resisted", coerce: Boolean },
                    pace : { type: "single", path : "track.pace", coerce: Boolean },
                    pace_unit : { type: "single", path : "track.pace_unit", coerce: String, allowed_values: ["rotation", "distance"]},
                    incline : { type: "single", path : "track.incline", coerce: Boolean },
                    incline_unit : { type: "single", path : "track.incline_unit", coerce: String, allowed_values : ["deg"] },
                    hr : { type: "single", path : "track.hr", coerce: Boolean },
                    cal : { type: "single", path : "track.cal", coerce: Boolean },

                    resistance_levels : {type: "list", path: "track.resistance_levels",
                        coerce : function(obj) {
                            if (obj.name) { obj.name = String(obj.name) }
                            if (obj.value) { obj.value = String(obj.value) }
                            return obj;
                        }
                    }
                };

                var Exercise = function() {
                    this.data = {};
                    this.schema = {};
                    this.allow_off_schema = false;
                };

                var proto = $.extend(octopus.dataobj.DataObjPrototype, octopus.service.ExercisePrototype);
                Exercise.prototype = proto;

                var dobj = new Exercise();
                dobj.schema = schema;
                if (params) {
                    if (params.raw) {
                        dobj.data = params.raw;
                    }
                }
                return dobj;
            },

            ExercisePrototype : {

            },

            exerciseForm : function(params) {
                var selector = params.selector;
                var exercise_id = params.exercise_id;

                function renderExerciseForm(frag) {
                    $(selector).html(frag);
                    octopus.service.bootExerciseForm()
                }

                function exerciseLoaded(data) {
                    if (data) {
                        octopus.page.data = octopus.service.newExercise({raw : data});
                    }
                    octopus.fragments.frag({
                        id: "exercise-form",
                        callback: renderExerciseForm
                    });
                }

                function exerciseLoadFail() {
                    alert("Failed to load exercise from API");
                }

                if (exercise_id) {
                    octopus.page.exercise_id = exercise_id;
                    octopus.crud.retrieve({
                        objtype : "exercise",
                        id : exercise_id,
                        success : exerciseLoaded,
                        error: exerciseLoadFail
                    });
                } else {
                    exerciseLoaded();
                }
            },

            bootExerciseForm : function() {

                function readForm() {
                    octopus.page.data = octopus.forms.form2obj({
                        form_selector: "#exercise-form",
                        form_data_object: octopus.service.newExercise()
                    });
                    if (octopus.page.exercise_id) {
                        octopus.page.data.set_field("id", octopus.page.exercise_id)
                    }
                }

                function writeForm() {
                    var obj = octopus.page.data;

                    // expand the relevant sections of the form to accommodate repeated fields
                    var akas = obj.get_field("aka") || [];
                    var rls = obj.get_field("resistance_levels") || [];

                    var available_akas = $("#aka_list").children().length;
                    var available_rls = $("#resisted-list").children().length;

                    var add_akas = akas.length - available_akas;
                    if (add_akas < 0) { add_akas = 0; }

                    var add_rls = rls.length - available_rls;
                    if (add_rls < 0) { add_rls = 0; }

                    for (var i = 0 ; i < add_akas; i++) {
                        octopus.forms.repeat({
                            list_selector : "#aka_list",
                            entry_prefix : "aka",
                            enable_remove: true,
                            remove_selector: ".remove-aka-field",
                            remove_callback: onRemoveAKA
                        })
                    }

                    for (var i = 0 ; i < add_rls; i++) {
                        octopus.forms.repeat({
                            list_selector : "#resisted-list",
                            entry_prefix : "resistance",
                            enable_remove: true,
                            remove_selector: ".remove-resisted-field",
                            remove_callback: onRemoveResisted
                        })
                    }

                    octopus.forms.obj2form({
                        form_selector: "#exercise-form",
                        form_data_object: octopus.page.data
                    });
                }

                function destroyParsley() {
                    if (octopus.page.exercise_form) {
                        octopus.page.exercise_form.destroy();
                    }
                    $(".has-error").removeClass("has-error");
                }

                function bounceParsley() {
                    destroyParsley();
                    octopus.page.exercise_form = $("#exercise-form").parsley();

                    // bind all the event handlers
                    octopus.page.exercise_form.subscribe("parsley:field:error", function(fieldInstance) {
                        fieldInstance["$element"].parents(".validation-container").addClass("has-error");
                    });
                }

                function updateTime() {
                    $("#last-saved").html("Last saved " + octopus.page.last_saved.fromNow());
                }

                function timedUpdate () {
                    updateTime();
                    setTimeout(timedUpdate, 1000);
                }

                $("#classes").select2();

                $("#muscles").select2();

                $("#pace").change(function() {
                    if ($(this).is(":checked")) {
                        $("#pace_unit").removeAttr("disabled");
                    } else {
                        $("#pace_unit").attr("disabled", "disabled");
                    }
                });

                $("#incline").change(function() {
                    if ($(this).is(":checked")) {
                        $("#incline_unit").removeAttr("disabled");
                    } else {
                        $("#incline_unit").attr("disabled", "disabled");
                    }
                });

                $("#resisted").change(function() {
                    if ($(this).is(":checked")) {
                        $(".resisted-conditional").removeAttr("disabled");
                        // re-disable the remove button if there is only one field
                        if ($("#resisted-list").children().length === 1) {
                            $(".remove-resisted-field").attr("disabled", "disabled");
                        }
                    } else {
                        $(".resisted-conditional").attr("disabled", "disabled");
                    }
                });

                function onMoreAKA() {}
                function onRemoveAKA() {}

                octopus.forms.bindRepeatable({
                    button_selector : ".add-aka-field",
                    list_selector: "#aka_list",
                    entry_prefix: "aka",
                    enable_remove: true,
                    remove_selector: ".remove-aka-field",
                    remove_behaviour: "disable",
                    // before_callback: destroyParsley,
                    more_callback: onMoreAKA,
                    remove_callback: onRemoveAKA
                });

                function onMoreResisted() {}
                function onRemoveResisted() {}

                octopus.forms.bindRepeatable({
                    button_selector : ".add-resisted-field",
                    list_selector: "#resisted-list",
                    entry_prefix: "resistance",
                    enable_remove: true,
                    remove_selector: ".remove-resisted-field",
                    remove_behaviour: "disable",
                    // before_callback: destroyParsley,
                    more_callback: onMoreResisted,
                    remove_callback: onRemoveResisted
                });

                $("#save").click(function(event) {
                    event.preventDefault();

                    // first ensure that we have the latest form data
                    readForm();

                    // validate the form (triggers events, which we consume elsewhere
                    bounceParsley();
                    var valid = octopus.page.exercise_form.validate();
                    if (!valid) {
                        alert("Please fill in the required fields");
                        return;
                    }

                    function onSuccess(data) {
                        octopus.page.exercise_id = data.id;
                        octopus.page.last_saved = moment();
                        updateTime();
                        if (!octopus.page.timedUpdates) {
                            timedUpdate();
                            octopus.page.timedUpdates = true;
                        }
                    }

                    function onError(data) {
                        alert("There was an error saving the exercise");
                    }

                    // now issue a create request on the CRUD API
                    if (!octopus.page.exercise_id) {
                        octopus.crud.create({
                            dataobj : octopus.page.data,
                            objtype: "exercise",
                            success : onSuccess,
                            complete : function() {},
                            error : onError
                        });
                    } else {
                        octopus.crud.update({
                            id : octopus.page.exercise_id,
                            dataobj: octopus.page.data,
                            objtype: "exercise",
                            success : onSuccess,
                            complete : function() {},
                            error : onError
                        });
                    }
                });

                if (octopus.page.exercise_id && octopus.page.data) {
                    writeForm();
                }
            }
        }
    });
});
