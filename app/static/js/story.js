/*
    All stuff related to Story's part
*/

// Story Predefined Search Buttons

$("#btn-sstat-all").on('click', function() {
    var $data = {filter: 'all', search: '-'};
    getRequest($STORY_GET_API_URL, $data, 'story', showAsTable);    
});

$("#btn-sstat-draft").on('click', function() {
    var $data = {filter: 'status', search: 'draft'};
    getRequest($STORY_GET_API_URL, $data, 'story', showAsTable);
});

$("#btn-sstat-inreview").on('click', function() {
    var $data = {filter: 'status', search: 'inreview'};
    getRequest($STORY_GET_API_URL, $data, 'story', showAsTable);
});

$("#btn-sstat-working").on('click', function() {
    var $data = {filter: 'status', search: 'working'};
    getRequest($STORY_GET_API_URL, $data, 'story', showAsTable);
});

$("#btn-sstat-implemented").on('click', function() {
    var $data = {filter: 'status', search: 'implemented'};
    getRequest($STORY_GET_API_URL, $data, 'story', showAsTable);
});

// Attach Issue to a story 
$('body').on('click', 'button#add-attach-issue', function(e) {
    e.preventDefault();
    var $attachTo = $('.story-add-issues');
    var $issue = $(this).parents('tr').find('td:first').text();
    attachIssue($issue, $attachTo);
});

$('body').on('click', 'button#attach-issue', function(e) {    
    // alert('going to edit issue...');
    e.preventDefault();
    var $attachTo = $('.story-issues');
    var $issue = $(this).parents('tr').find('td:first').text();
    attachIssue($issue, $attachTo);
});

function attachIssue(issue, elem) {
    var $elem = elem || $('.story-issues');
    var $attach = '<button class="btn btn-primary btn-xs detach-issue">' + issue + '</button';
    
    var attachedIssues = getAttachedIssues();

    if ( $.inArray(issue, attachedIssues ) != -1 ) {
        showMessage('Issue is already attached!', 'error');
        return false;
    }

    if ( attachedIssues.length >= 10 ) {
        showMessage("Maximum 10 Issues can be attached to a story", 'error')
        return false;
    }

    $elem.append($attach);
}

// Add Story - Attach Issue 
$('#story-add-issue-search-btn').on('click', function(e) {
    e.preventDefault();
    var $txt = $('#story-add-issue-search-text').val().trim();
    var $resultElem = $('#story-add-issue-search-result');

    if ( $txt ) {
        var $url = constuctURL(['issue', 'get']);
        getRequest($url, {filter: 'id', search: $txt}, query='issue', issueAttachShowAsTable, genericFailFunc, {resultElement: $resultElem, action: 'add'});
    }
});

// Edit Story - Attach Issue 
$('#story-issue-search-btn').on('click', function(e) {
    e.preventDefault();
    var $txt = $('#story-issue-search-text').val().trim();
    if ( $txt ) {
        var $url = constuctURL(['issue', 'get']);    
        getRequest($url, {filter: 'id', search: $txt}, query='issue', issueAttachShowAsTable);        
    }
});

// detach issue
$('body').on('click', 'button.detach-issue', function(e) {
    // alert('going to edit issue...');
    e.preventDefault();
    $(this).remove();
});

// Edit Story buttons 

$('body').on('click', 'button#btn-story-edit', function() {    
    var $row = $(this).parents('tr');
    var $id = $row.find('td:first').text();
    var $url = constuctURL(['story', 'get']);    
    getRequest($url, {filter: 'id', search: $id}, query='story', fillItemForm);
    $('#edit-story').modal();
});

// Delete Story
$('#delete-story').on('click', function(e) {
    e.preventDefault();
    var $id = $('#story-edit-id').val();
    var $title = $('#story-edit-title').val();

    ok = confirm("Are you sure you want to delete below story?\n\n ID:  " + $id + "\nTitle: " + $title);

    if ( ok ) {
        var doneFunc = function(data, id) { 
            alert($id + ' Deleted Successfully!'); 
            $('#form-edit-story').trigger('reset');
            $('#btn-sstat-all').trigger('click');
            $('#edit-issue').modal("hide");
        }
        var failFunc = function(err, id) { 
            alert('Error: Failed to deleted story [' + $id + '], please try again later...\n Error: \n' + JSON.stringify(err)); 
            $('#edit-story').modal("hide");
        }

        var $url = constuctURL(['story', 'delete']);
        getRequest($url, {id: $id}, query=$id, doneFunc, failFunc);
    }
});

$('#btn-add-story').on('click', function(e) {
    $('#form-add-story').trigger('reset');
    cleanupStoryNonFormElements();
    $('#add-story').modal();
});

$('#update-story').on('click', function(e) {
    e.preventDefault();

    var $data = {
        id: $('#story-edit-id').val(),
        title: $('#story-edit-title').val(),
        desc: $('#story-edit-desc').val(),
        tag: $('#story-edit-tag').val(),
        status: $('#story-edit-status').val(),
        url: $('#story-edit-url').val(),
        issues: getAttachedIssues().join(',')
    };

    r = validate($data, skip=['tag', 'issues']);

    if (!r.ok) {
        alert('Validation Failed, Please correct below errors\n\n' + r.error);
        return false;
    }

    var doneFunc = function(result) {
        $('#form-edit-story').trigger('reset');
        $('#btn-sstat-all').trigger('click');
        $('#edit-story').modal('hide');
        cleanupStoryNonFormElements();
    }

    var failFunc = function(err) {
        var $err = JSON.stringify(err);
        alert('Failed to update issue, please see the error\n\n'+ $err);
        $('#form-edit-story').trigger('reset');
        $('#edit-story').modal('hide');
        cleanupStoryNonFormElements();
    }

    var $url = constuctURL(['story', 'update']);
    postRequest($url, $data, 'story', doneFunc, failFunc);
});

$('#save-story').on('click', function(e) {
    e.preventDefault();

    var $data = {
        title: $('#story-add-title').val(),
        desc: $('#story-add-desc').val(),
        tag: $('#story-add-tag').val(),
        status: $('#story-add-status').val(),
        url: $('#story-add-url').val(),
        issues: getAttachedIssues().join(',')
    };

    r = validate($data, optional=['tag', 'issues']);

    if (!r.ok) {
        alert('Validation Failed, Please correct below errors\n\n' + r.error);
        return false;
    }

    var doneFunc = function(result) {
        $('#form-add-story').trigger('reset');
        $('#btn-sstat-all').trigger('click');
        $('#add-story').modal('hide');
        cleanupStoryNonFormElements();
    }

    var failFunc = function(err) {
        var $err = JSON.stringify(err);
        alert('Failed to create an issue, please see the error\n\n'+ $err);
        $('#form-add-story').trigger('reset');
        $('#add-story').modal('hide');
        cleanupStoryNonFormElements();
    }

    var $url = constuctURL(['story', 'add']);
    postRequest($url, $data, 'story', doneFunc, failFunc);
});

$('#btn-story-search').on('click', function(e) {
    e.preventDefault();
    var $type = $('#type-search').val().toLowerCase(),
        $term = $('#text-search').val();

    if ( $type == 'type' ) {
        $('#text-search').val('Stories can not be searched for type');
        return false;
    }
    getRequest($STORY_GET_API_URL, {filter: $type, search: $term}, 'story', showAsTable);
});

function cleanupStoryNonFormElements() {
    $(".story-issues").empty();
    $("#story-issue-search-result").empty();
    $("#story-issue-search-text").empty();

    $(".story-add-issues").empty();
    $("#story-add-search-text").empty();
    $("#story-add-issue-search-result").empty();
}

$('#preview-add-story').on('click', function(e) {
    e.preventDefault();
    var $textElement = $('#story-add-desc').val();
    previewHTML($textElement);
});

$('#preview-edit-story').on('click', function(e) {
    e.preventDefault();
    var $textElement = $('#story-edit-desc').val();
    previewHTML($textElement);
});

