jQuery(document).ready(function($) {

    /****************************************************************
     * Exercises Facetview Theme
     *****************************
     */

    function discoveryRecordView(options, record) {
        var exercise = octopus.service.newExercise({raw : record});
        var display_frag = octopus.fragments.cached({ id : "exercise-result" });

        var name = octopus.string.escapeHtml(exercise.get_field("name"));
        var desc = octopus.string.escapeHtml(exercise.short_desc(100));
        var eid = octopus.string.escapeHtml(exercise.get_field("id"));

        display_frag = display_frag.replace(/{Exercise Name}/g, name);
        display_frag = display_frag.replace(/{Short exercise description}/g, desc);
        display_frag = display_frag.replace(/{exercise id}/g, eid);

        var result = options.resultwrap_start;
        result += display_frag;
        result += options.resultwrap_end;
        return result;
    }


    function doExerciseFacetview() {

        var facets = [];
        facets.push({'field': 'classes', 'display': 'Exercise Type'});
        facets.push({'field': 'movement', 'display': 'Movement'});
        facets.push({'field': 'main_muscles', 'display': 'Main Muscles'});
        facets.push({'field': 'targeted_muscles', 'display': 'Targeted Muscles'});

        $('#exercises').facetview({
            debug: false,
            search_url : octopus.config.exercise_endpoint,
            page_size : 25,
            facets : facets,
            search_sortby : [
                {'display':'Primary Name','field':'name'},
            ],
            searchbox_fieldselect : [
                {'display':'Name/AKA','field':'index.name'},
                {'display':"Description", field: "description"}
            ],
            render_result_record : discoveryRecordView
            // post_render_callback: bindButtons
        });
    }

    octopus.fragments.preload({
        id : "exercise-result",
        callback : doExerciseFacetview
    });

});
