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
                    movement : { type: "list", path: "info.movement", coerce: String },
                    main_muscles : { type : "list", path : "info.main_muscles", coerce: String},
                    targeted_muscles : { type: "list", path: "info.targeted_muscles", coerce: String },
                    owner : { type: "single", path : "admin.owner", coerce: String },
                    canon : { type: "single", path : "admin.canon", coerce: Boolean },
                    weight : { type: "single", path : "track.weight", coerce: Boolean },
                    reps : { type: "single", path : "track.reps", coerce: Boolean },
                    tempo : { type: "single", path : "track.tempo", coerce: Boolean },
                    assist : { type: "single", path : "track.assist", coerce: Boolean },
                    time : { type: "single", path : "track.time", coerce: Boolean },
                    speed : { type: "single", path : "track.speed", coerce: Boolean },
                    distance : { type: "single", path: "track.distance", coerce: Boolean },
                    resisted : { type: "single", path : "track.resisted", coerce: Boolean },
                    resistance_upper : { type: "single", path: "track.resistance_settings.upper", coerce: parseInt },
                    resistance_increment : {type : "single", path: "track.resistance_settings.increment", coerce: parseFloat},
                    incline : { type: "single", path : "track.incline", coerce: Boolean },
                    incline_upper : { type: "single", path : "track.incline_settings.upper", coerce:  parseInt},
                    incline_increment : { type: "single", path : "track.incline_settings.increment", coerce:  parseFloat},
                    incline_unit : { type: "single", path : "track.incline_settings.unit", coerce: String, allowed_values : ["degrees", "pc"] },
                    hr : { type: "single", path : "track.hr", coerce: Boolean },
                    cal : { type: "single", path : "track.cal", coerce: Boolean }
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
                short_desc : function(len) {
                    var desc = this.get_field("description");
                    if (desc === undefined) {
                        return "";
                    }
                    if (desc.length <= len + 3) {
                        return desc
                    }
                    return desc.substring(0, len) + "..."
                }
            },

            setPreview : function(params) {
                var selector = params.selector;
                var dataobj = params.dataobj;
                var callback = params.callback;

                function showPreview(html) {
                    $(selector).html(html);
                    if (callback) {
                        callback();
                    }
                }

                var postdata = JSON.stringify(dataobj.data);

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    dataType: "html",
                    url: octopus.config.set_preview_endpoint,
                    data : postdata,
                    success: showPreview
                })
            },

            exerciseForm : function(params) {
                var selector = params.selector;
                var exercise_id = params.exercise_id;
                var save_callback = params.save_callback;

                function renderExerciseForm(frag) {
                    $(selector).html(frag);
                    octopus.service.bootExerciseForm({
                        save_callback: save_callback
                    })
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

            bootExerciseForm : function(params) {

                var save_callback = params.save_callback;

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
                    var available_akas = $("#aka_list").children().length;

                    var add_akas = akas.length - available_akas;
                    if (add_akas < 0) { add_akas = 0; }

                    for (var i = 0 ; i < add_akas; i++) {
                        octopus.forms.repeat({
                            list_selector: "#aka_list",
                            entry_prefix: "aka",
                            enable_remove: true,
                            remove_behaviour: "disable",
                            remove_selector: ".remove-aka-field",
                            remove_callback: onRemoveAKA
                        })
                    }

                    // now write the object to the form
                    octopus.forms.obj2form({
                        form_selector: "#exercise-form",
                        form_data_object: octopus.page.data
                    });

                    // finally, enable/disable the relevant sections based on what was already
                    // checked in the checkboxes
                    $("#incline").trigger("change");
                    $("#resisted").trigger("change");

                    // update the last saved time
                    octopus.page.last_saved = moment(octopus.page.data.get_field("last_updated"));
                    triggerTimeUpdates();
                }

                function destroyParsley() {
                    if (octopus.page.exercise_form) {
                        octopus.page.exercise_form.destroy();
                    }
                    $(".has-error").removeClass("has-error");
                    $("#incline_error").hide();
                    $("#resisted_error").hide();
                    $("#general_error").hide();
                }

                function bounceParsley() {
                    destroyParsley();
                    octopus.page.exercise_form = $("#exercise-form").parsley();

                    // bind all the event handlers
                    octopus.page.exercise_form.subscribe("parsley:field:error", function(fieldInstance) {
                        fieldInstance["$element"].parents(".validation-container").addClass("has-error");
                        if (octopus.string.startsWith(fieldInstance["$element"].attr("name"), "incline_")) {
                            $("#incline_error").show();
                        }
                        if (octopus.string.startsWith(fieldInstance["$element"].attr("name"), "resistance_")) {
                            $("#resisted_error").show();
                        }
                    });
                }

                function updateTime() {
                    $("#last-saved").html("Last saved " + octopus.page.last_saved.fromNow());
                }

                function timedUpdate () {
                    updateTime();
                    setTimeout(timedUpdate, 1000);
                }

                function triggerTimeUpdates() {
                    if (!octopus.page.timedUpdates) {
                        timedUpdate();
                        octopus.page.timedUpdates = true;
                    }
                }

                // all the select2 fields
                $("#classes").select2({placeholder : "Select an exercise type"});
                $("#movement").select2({placeholder : "Select a movement type"});
                $("#main_muscles").select2({placeholder : "Select the main muscle groups involved"});
                $("#targeted_muscles").select2({placeholder : "Select the muscles within the group that are targeted"});

                $("#incline").change(function() {
                    if ($(this).is(":checked")) {
                        $("#incline_unit").removeAttr("disabled").attr("data-parsley-required", "true");
                        $("#incline_upper").removeAttr("disabled").attr("data-parsley-required", "true");
                        $("#incline_increment").removeAttr("disabled").attr("data-parsley-required", "true");
                    } else {
                        $("#incline_unit").attr("disabled", "disabled").attr("data-parsley-required", "false");
                        $("#incline_upper").attr("disabled", "disabled").attr("data-parsley-required", "false");
                        $("#incline_increment").attr("disabled", "disabled").attr("data-parsley-required", "false");
                    }
                });

                $("#resisted").change(function() {
                    if ($(this).is(":checked")) {
                        $("#resistance_upper").removeAttr("disabled").attr("data-parsley-required", "true");
                        $("#resistance_increment").removeAttr("disabled").attr("data-parsley-required", "true");
                    } else {
                        $("#resistance_upper").attr("disabled", "disabled").attr("data-parsley-required", "false");
                        $("#resistance_increment").attr("disabled", "disabled").attr("data-parsley-required", "false");
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

                $("#save").click(function(event) {
                    event.preventDefault();

                    // disable the save button, to avoid multiple presses
                    $(this).attr("disabled", "disabled");

                    // first ensure that we have the latest form data
                    readForm();

                    // validate the form (triggers events, which we consume elsewhere
                    bounceParsley();
                    var valid = octopus.page.exercise_form.validate();
                    if (!valid) {
                        $("#general_error").show();
                        // note that we don't remove the disabled save button, because the user
                        // has to interact with the form before they can save again
                        return;
                    }

                    function onSuccess(data) {
                        if (data.id) {
                            octopus.page.exercise_id = data.id;
                        }
                        octopus.page.last_saved = moment();
                        updateTime();
                        triggerTimeUpdates();

                        if (save_callback) {
                            save_callback()
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

                $("#exercise-form").find(":input").change(function() {
                    $("#save").removeAttr("disabled");
                });

                if (octopus.page.exercise_id && octopus.page.data) {
                    writeForm();
                }
            }
        }
    });
});
