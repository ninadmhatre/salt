/*
    All stuff related to Issue's part
*/

$('#btn-issue-all').on('click', function() {
    var $data = {filter: 'all', search: '-'};
    getRequest($ISSUE_GET_API_URL, $data, 'issue', showAsTable);
});

$('#btn-istat-open').on('click', function() {
    var $data = {filter: 'status', search: 'open'};
    getRequest($ISSUE_GET_API_URL, $data, 'issue', showAsTable);
});

$('#btn-istat-working').on('click', function() {
    var $data = {filter: 'status', search: 'working'};
    getRequest($ISSUE_GET_API_URL, $data, 'issue', showAsTable);    
});

$('#btn-istat-testing').on('click', function() {
    var $data = {filter: 'status', search: 'testing'};
    getRequest($ISSUE_GET_API_URL, $data, 'issue', showAsTable);        
});

$('#btn-istat-completed').on('click', function() {
    var $data = {filter: 'status', search: 'completed'};
    getRequest($ISSUE_GET_API_URL, $data, 'issue', showAsTable);    
});

$('#btn-istat-noissue').on('click', function() {
    var $data = {filter: 'status', search: 'noissue'};
    getRequest($ISSUE_GET_API_URL, $data, 'issue', showAsTable);
});

// Issue by "Type"

$("#btn-itype-bug").on('click', function() {
    var $data = {filter: 'type', search: 'bug'};
    getRequest($ISSUE_GET_API_URL, $data, 'issue', showAsTable);
});

$("#btn-itype-task").on('click', function() {
    var $data = {filter: 'type', search: 'task'};
    getRequest($ISSUE_GET_API_URL, $data, 'issue', showAsTable);
});

$("#btn-itype-feature").on('click', function() {
    var $data = {filter: 'type', search: 'feature'};
    getRequest($ISSUE_GET_API_URL, $data, 'issue', showAsTable);
});

$('#btn-issue-search').on('click', function(e) {
    e.preventDefault();
    var $type = $('#type-search').val().toLowerCase(),
        $term = $('#text-search').val();

    getRequest($ISSUE_GET_API_URL, {filter: $type, search: $term}, 'issue', showAsTable);
});

//
// Edit Issue button handler
//
$('body').on('click', 'button#btn-issue-edit', function() {    
    // alert('going to edit issue...');
    var $row = $(this).parents('tr');
    var $id = $row.find('td:first').text();
    var $url = constuctURL(['issue', 'get']);    
    getRequest($url, {filter: 'id', search: $id}, query='issue', fillItemForm);
    $('#edit-issue').modal();
});

//
// Delete Issue 
//
$('#delete-issue').on('click', function(e) {
    e.preventDefault();
    var $id = $('#issue-edit-id').val();
    var $title = $('#issue-edit-title').val();

    ok = confirm("Are you sure you want to delete issue [" + $id + "]?");

    if ( ok ) {
        var doneFunc = function(data, id) { 
            alert($id + ' Deleted Successfully!'); 
            $('#edit_issue').modal("hide");
            $('#form-edit-issue').trigger('reset');
            $('#btn-issue-all').trigger('click');
            $('#edit-issue').modal("hide");
        }
        var failFunc = function(err, id) { 
            alert('Error: Failed to deleted issue [' + $id + '], please try again later...\n Error: \n' + JSON.stringify(err)); 
            $('#edit-issue').modal("hide");
        }

        var $url = constuctURL(['issue', 'delete']);
        getRequest($url, {id: $id}, query=$id, doneFunc, failFunc);
    }
});

//
// Add & Edit Issue's
//
$('#btn-add-issue').on('click', function(e) {
    $('#add_issue').modal();
});

$('#update-issue').on('click', function(e) {
    e.preventDefault();

    var $data = {
        id: $('#issue-edit-id').val(),
        title: $('#issue-edit-title').val(),
        desc: $('#issue-edit-desc').val(),
        tag: $('#issue-edit-tag').val(),
        type: $('#issue-edit-type').val(),
        status: $('#issue-edit-status').val(),
        url: $('#issue-edit-url').val()
    };

    r = validate($data, skip=['tag']);

    if (!r.ok) {
        alert('Validation Failed, Please correct below errors\n\n' + r.error);
        return false;
    }

    var doneFunc = function(result) {
        $('#form-edit-issue').trigger('reset');
        $('#btn-issue-all').trigger('click');
        $('#edit-issue').modal('hide');
    }

    var failFunc = function(err) {
        var $err = JSON.stringify(err.responseJSON.error);
        alert('Failed to update issue, please see the error\n\n'+ $err);
        $('#edit-issue').modal('hide');
    }

    var $url = constuctURL(['issue', 'update']);
    postRequest($url, $data, 'issue', doneFunc, failFunc);

});

$('#save-issue').on('click', function(e) {
    e.preventDefault();

    var $data = {
        title: $('#issue-add-title').val(),
        desc: $('#issue-add-desc').val(),
        tag: $('#issue-add-tag').val(),
        type: $('#issue-add-type').val(),
        status: $('#issue-add-status').val(),
        url: $('#issue-add-url').val()
    };

    var r = validate($data, optional=['tag']);

    if (!r.ok) {
        alert('Validation Failed, Please correct below errors\n\n' + r.error);
        return false;
    }

    var doneFunc = function(result) {
        $('#form-add-issue').trigger('reset');
        $('#btn-issue-all').trigger('click');
        $('#add-issue').modal('hide');
    }

    var failFunc = function(err) {
        var $err = JSON.stringify(err);
        alert('Failed to add issue, please see the error\n\n'+ $err);
        $('#add-issue').modal('hide');
    }

    var $url = constuctURL(['issue', 'add']);
    postRequest($url, $data, 'issue', doneFunc, failFunc);
});


$('#preview-add-issue').on('click', function(e) {
    e.preventDefault();
    var $textElement = $('#issue-add-desc').val();
    previewHTML($textElement);
});

$('#preview-edit-issue').on('click', function(e) {
    e.preventDefault();
    var $textElement = $('#issue-edit-desc').val();
    previewHTML($textElement);
});



