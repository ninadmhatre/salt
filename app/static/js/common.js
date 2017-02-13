function constuctURL(suffix) {
    var $base = ['/api', 'v1'];
    $base.push(suffix.join('/'));
    return $base.join('/');
}

// Issue Predefined Search Buttons
var $ISSUE_GET_API_URL = constuctURL(['issue', 'get']);
var $STORY_GET_API_URL = constuctURL(['story', 'get']);
var MD_2_HTML_CONVERTOR = new showdown.Converter();

var genericFailFunc = function(err) {
    var $e = $('#result');
    $e.html('<h4 class="text-center">Failed to fetch data!</h4><br><pre><code>' + err + '</code></pre>');
}

function previewHTML(text) {
    var $html = MD_2_HTML_CONVERTOR.makeHtml(text);
    $('#preview-desc').modal();
    var $displayElement = $('div#preview-content');
    $displayElement.empty();
    $displayElement.html($html);
}

$('button.get-ref-url').on('click', function(e) {
    e.preventDefault();
    var $top = $(this).parent().parent();
    var $input = $top.find('.ref_url');
    if ( $input ) {
        console.log('Setting up using parent...');
        $input.val(getRefOrCurrentURL());
    } else {
        $('#issue-url').val(getRefOrCurrentURL());
    }
    return false;
});

$('#type-search').on('change', function() {
    var $selected = $(this).val();
    var $ip = $('input#text-search');
    $ip.val('');
    if ($selected == 'type') {
        $('button#btn-story-search').prop('disabled', true);
        $ip.attr('placeholder', "Search by 'type' is not available for story!");
    } else {
        $('button#btn-story-search').prop('disabled', false);
        if ($selected == 'url') {
            $('input#text-search').val(getRefOrCurrentURL());
        }
        $ip.attr('placeholder', "Search by '" + $selected + "' ...");
    }
});

// Functions
// Ajax

var getRequest = function(url, data, query, doneCB, failCB, funcParamDict) {
    failCB = failCB || genericFailFunc;
    funcParamDict = funcParamDict || {};

    $.get(url, data)
        .done(function(result) {
            doneCB(result, query, funcParamDict);
        })
        .fail(function(error) {
            failCB(error, query, funcParamDict);
        });
}

var postRequest = function(url, data, query, doneCB, failCB, funcParamDict) {
    failCB = failCB || genericFailFunc;
    funcParamDict = funcParamDict || {};

    $.post(url, data)
        .done(function(result) {
            doneCB(result, query, funcParamDict);
        })
        .fail(function(error, query) {
            failCB(error, query, funcParamDict);
        });
}

// Helper
var showAsTable = function(data, query, params) {
    var $e = params['resultElement'] || $('#result');

    if ( data == undefined || data == null || data.length == 0 ) {
        $e.html('<div class="text-center"><h4>No Results Found!</h4></div>');
        return false; 
    } else {
        var tblHeader = [],
            tblEnd = '',
            tblBody = '';

        tblHeader.push('<table class="table table-stripped">');
        tblHeader.push('<thead><tr>');
            tblHeader.push('<th>ID</th>');
            if ( query == 'issue' ) {
                tblHeader.push('<th>Type</th>');
            }
            tblHeader.push('<th>Title</th>');
            tblHeader.push('<th>Desc</th>');
            tblHeader.push('<th>Tag</th>');
            tblHeader.push('<th>Status</th>');
            tblHeader.push('<th>URL</th>');
            tblHeader.push('<th>Created At (UTC)</th>');
            tblHeader.push('<th>Action</th>');
        tblHeader.push('</tr>');
        tblHeader.push('<tbody>');

        tblEnd = '</tbody></table>';

        $(data).each(function(key, val) {
            // console.log(key, val);
            tblBody += '<tr>';
            tblBody += '  <td>' + val.id + '</td>';
            if ( query == 'issue' ) {
                tblBody += '  <td>' + val.type + '</td>';
            }
            tblBody += '  <td>' + val.title + '</td>';
            tblBody += '  <td>' + toMarkdown(getSubstring(val.desc)) + '</td>';
            tblBody += '  <td>' + val.tag + '</td>';
            tblBody += '  <td>' + val.status + '</td>';
            tblBody += '  <td>' + val.url + '</td>';
            tblBody += '  <td title="updated at: ' +  val.utime + '">' + val.ctime + '</td>';

            var $editBtnId = (query == 'issue')? 'btn-issue-edit':'btn-story-edit';

            tblBody += '  <td><button class="btn btn-warning btn-xs" id="' + $editBtnId + '">Edit</button></td>';
        });

        var $final = tblHeader.join('\n') + tblBody + tblEnd;
        $e.html($final);
    }
}

function issueAttachShowAsTable(data, query, params) {
    var $e = params['resultElement'] || $('#story-issue-search-result');
    var $action = params['action'] || 'edit';

    if ( data == undefined || data == null || data.length == 0 ) {
        $e.html('<div class="text-center"><h4>No matching issues found!</h4></div>');
        return false; 
    } else {
        var tblHeader = [],
            tblEnd = '',
            tblBody = '';

        tblHeader.push('<table class="table table-stripped">');
        tblHeader.push('<thead><tr>');
            tblHeader.push('<th>ID</th>');
            tblHeader.push('<th>Title</th>');
            tblHeader.push('<th>Tag</th>');
            tblHeader.push('<th>Status</th>');
            tblHeader.push('<th>URL</th>');
            tblHeader.push('<th>Action</th>');
        tblHeader.push('</tr>');
        tblHeader.push('<tbody>');

        tblEnd = '</tbody></table>';

        var $btnId = ( $action == 'add' )? 'add-attach-issue': 'attach-issue';

        $(data).each(function(key, val) {
            console.log(key, val);
            var $toolTip = "Type:" + val.type + ", Created At:" + val.ctime;
            
            tblBody += '<tr>';
            tblBody += '  <td title="' + $toolTip + '">' + val.id + '</td>';
            tblBody += '  <td>' + val.title + '</td>';
            tblBody += '  <td>' + val.tag + '</td>';
            tblBody += '  <td>' + val.status + '</td>';
            tblBody += '  <td>' + val.url + '</td>';
            tblBody += '  <td><button class="btn btn-primary btn-xs" id="' + $btnId + '">Attach</button></td>';
        });

        var $final = tblHeader.join('\n') + tblBody + tblEnd;
        $e.html($final);
    }
}

function fillItemForm(data, query, params) {
    d = data;
    if ( d != undefined ) {
        $('#' + query + '-edit-id').val(d.id);
        $('#' + query + '-edit-title').val(d.title);
        $('#' + query + '-edit-desc').val(toMarkdown(d.desc));
        $('#' + query + '-edit-tag').val(d.tag);
        $('#' + query + '-edit-url').val(d.url);
        $('#' + query + '-edit-status').val(d.status);
        if ( query == 'issue' ) {
            $('#' + query + '-edit-type').val(d.type);
        } else {
            cleanupStoryNonFormElements();
            $.each(d.issues, function(idx, ival) {
                if ( ival != '' ) {
                    attachIssue(ival);
                }
            });
        }
    }
    console.log(d);
}

function getSubstring(text, till) {
    till = till || 20;

    if ( text ) {
        if ( text.length > 20 ) {
            text = text.substring(0, till) + '...';
        }
        return text;
    }
    return text;
}

function validate(data, optional) {
    optional = optional || [];
    var $err = [];
    $.each(data, function(k, v) {
        if ( $.inArray(k, optional) == -1 && (v == null || v == "")) {
            $err.push('Null or Blank value for ' + k + ' field');
        }
    });

    if ($err.length > 0) {
        return {error: $err.join('\n'), ok: false};
    }
    return {error: null, ok: true};
}

function getRefOrCurrentURL() {
    var $u = document.URL;
    var idx = $u.indexOf('ref_url'); 
    if ( idx == -1) {  // Not found
        $u = getDomainLessUrl($u);
    } else {
        $u = $u.substring(idx + 8);
    }
    return $u;
}

function getDomainLessUrl(fullUrl) {
    return fullUrl.replace(/.*\/\/[^\/?]*/, '');
}

function showMessage(msg, type) {
    // Replace with toastr
    alert(msg);
}

function getAttachedIssues() {
    var attached = [];
    $('button.detach-issue').each(function() {
        var $t = $(this).text();
        if ( $.inArray($t, attached) == -1 ) {
            attached.push($(this).text());   
        }
    });

    return attached;
}