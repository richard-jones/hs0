jQuery(document).ready(function($) {

    /****************************************************************
     * Exercises Facetview Theme
     *****************************
     */

    function discoveryRecordView(options, record) {
        var exercise = octopus.service.newExercise({raw : record});

        var name = exercise.get_field("name");
        var desc = exercise.short_desc(100);

        var result = options.resultwrap_start;
        result += "<div class='row'>";
        result += "<div class='col-md-9'>";
        result += "<strong style='font-size: 150%'>" + name + "</strong><br>";
        result += "<p>" + desc + "</p>";
        result += "<div class='col-md-3'>";
        result += "</div></div>";
        result += options.resultwrap_end;
        return result;
    }

    var facets = [];
    facets.push({'field': 'classes', 'display': 'Exercise Type'});
    facets.push({'field': 'muscles', 'display': 'Muscles Used'});

    $('#exercises').facetview({
        debug: false,
        search_url : octopus.config.exercise_endpoint, // defined in the template which calls this
        page_size : 25,
        facets : facets,
        search_sortby : [
            {'display':'Name','field':'name'},      // should be an index field like index.name
        ],
        searchbox_fieldselect : [
            {'display':'Name','field':'name'},      // that will mean that the search box can work on index.name too
            {'display':'AKA','field':'aka'},
            {'display':"Description", field: "description"}
        ],
        render_result_record : discoveryRecordView
    });

});
