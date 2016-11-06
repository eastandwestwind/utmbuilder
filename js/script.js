
if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}

/**
 * FirebaseUI initialization to be used in a Single Page application context.
 */
// FirebaseUI config.
var uiConfig = {
    'callbacks': {
        // Called when the user has been successfully signed in.
        'signInSuccess': function(user, credential, redirectUrl) {
            handleSignedInUser(user);
            // Do not redirect.
            return false;
        }
    },
    // Opens IDP Providers sign-in flow in a popup.
    'signInFlow': 'popup',
    'signInOptions': [
        {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            scopes: ['https://www.googleapis.com/auth/plus.login']
        },
    ],
    // Terms of service url.
    'tosUrl': 'https://www.google.com'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Keep track of the currently signed in user.
var currentUid = null;


/**
 * Displays the UI for a signed in user.
 */
var handleSignedInUser = function(user) {
    $('#save').prop("disabled",false);
    currentUid = user.uid;
    $('#SelectData').show();
    document.getElementById('user-signed-in').style.display = 'block';
    document.getElementById('user-signed-out').style.display = 'none';
    document.getElementById('email').textContent = user.email;
    updateDropdown(currentUid);
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
    $('#save').prop("disabled",true);
    $('#SelectData').hide();
    $('#delete').hide();
    document.getElementById('user-signed-in').style.display = 'none';
    document.getElementById('user-signed-out').style.display = 'block';
    ui.start('#firebaseui-auth-container', uiConfig);
    currentUid = null;
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
    // The observer is also triggered when the user's token has expired and is
    // automatically refreshed. In that case, the user hasn't changed so we should
    // not update the UI.
    if (user && user.uid == currentUid) {
        return;
    }
    document.getElementById('loading').style.display = 'none';
    document.getElementById('loaded').style.display = 'block';
    user ? handleSignedInUser(user) : handleSignedOutUser();
});

// display saved data in dropdown every time new data is saved or new user logged in
var updateDropdown = function(userId, filename){
    var selectData = $('#SelectData');
    selectData.children().remove();
    if (!filename){
        $('#delete').hide();
        var opt = $('<option>');
        opt.text('select data...');
        opt.val('');
        selectData.append(opt);
    }
    else {
        $('#delete').show();
    }
    return firebase.database().ref('utm-set/' + userId).once('value').then(function(snapshotList) {
        snapshotList.forEach(function(usr){
            var opt = $('<option>');
            opt.text(usr.key);
            opt.val(usr.key);
            if (usr.key == filename) {
                opt.prop('selected', true);
            }
            selectData.append(opt);
        })
    });

}
/**
 * Initializes the app.
 */
var initApp = function() {
    document.getElementById('sign-out').addEventListener('click', function() {
        firebase.auth().signOut();
    });
    document.getElementById('delete-account').addEventListener(
        'click', function() {
            dangerous('Dude!! Are you sure you want to delete your account? You will lose all your saved UTM data if you click Delete.',
                function() {
                    firebase.auth().currentUser.delete();
                }
            );
        });
};



window.addEventListener('load', initApp);


// appending input to array
// var lineArray = [];
// data.forEach(function (infoArray, index) {
//     var line = infoArray.join(",");
//     lineArray.push(index == 0 ? "data:text/csv;charset=utf-8," + line : line);
// });

// var csvContent = lineArray.join("\n");

// var encodedUri = encodeURI(csvContent);
// window.open(encodedUri);

// button add logic
$("a.my-tool-tip").tooltip();

//XLSX functions

function sheet_from_array_of_arrays(data, opts) {
	var ws = {};
	var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	for(var R = 0; R != data.length; ++R) {
		for(var C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;
			var cell = {v: data[R][C] };
			if(cell.v == null) continue;
			var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
				cell.t = 'n'; cell.z = XLSX.SSF._table[14];
				cell.v = datenum(cell.v);
			}
			else cell.t = 's';

			ws[cell_ref] = cell;
		}
	}
	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
	return ws;
}

function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}

function s2ab(s) {
	var buf = new ArrayBuffer(s.length);
	var view = new Uint8Array(buf);
	for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
	return buf;
}

//csv functions

var downloadData = function (type, data, filename) {
	var link = document.createElement('a');
	link.download = filename;
	link.href = encodeURI('data:' + type + ',' + data);
	link.style.display = 'none';
	document.getElementsByTagName('body')[0].appendChild(link);
	link.click();
	document.getElementsByTagName('body')[0].removeChild(link);
};

var getRawInputRows = function() {
	var rawInputRows = [];
	$('.entryLines').each(function(){
		var row = [];
		$(this).find('input').each(function(colNum){
			row.push($(this).val().trim());
		});
		rawInputRows.push(row);
	});
	return rawInputRows;
};

// escape utility
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

// to replace underscores
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function restoreRows(savedInput) {
    $('.entryLines').not(':first-child').remove();
    $(savedInput).each(function () {
        var lastLine = $('.entryLines').last();
        var newLine = lastLine.clone();
        $(lastLine).after(newLine);
        var fields = newLine.find('input');
        $(this).each(function (i) {
            $(fields.get(i)).val(this);
        });
    });
    $('.entryLines').first().remove();
}

// jquery modal popup dialogue
function dangerous(message, yesCallback) {
    $('#modal_dialog').html(message);
    var dialog = $('#modal_dialog').dialog({
        title: 'Delete?',
        buttons: [
            {text: "Cancel",
            id: "cancelButton",
            click: function() {
                $(this).dialog('close');
            }},
            {text: "Delete",
            id: "deleteButton",
            click: function() {
                $(this).dialog('close');
                yesCallback();
            }}
        ]
    });
}

$(function()
{
    $(document)
    .on('click', '#newButton', function (e)
    {
        e.preventDefault();
        $('.container-fluid').show();
    })
    .on('click', '.btn-add', function (e)
    {
        e.preventDefault();
        console.log("button logic function")
        var currentEntry = $(this).closest('.entryLines');
        var clone = $(currentEntry).clone();
        clone.find("input").addClass('copiedLine');
        clone.insertAfter(currentEntry);
        console.log($(currentEntry).index()+1);

    })
    .on('focus','.copiedLine', function (e)
    {
        $(this).closest('.entryLines').find("input").removeClass('copiedLine');
    })
    .on('click', '.btn-remove', function(e)
    {
        var nLines = $('.entryLines').length;
        if (nLines > 1){
		  $(this).closest('.entryLines').remove();
        }
		e.preventDefault();
		return false;
    })

   .on('click', '#download', function(g)
    {
    try{
        var format = $('.selectpicker').find(":selected").text();
        var parameterNames = ['utm_source', 'utm_medium', 'utm_content', 'utm_term', 'utm_campaign'];
        var rawInputRows = getRawInputRows();
        var lines = [];
        if (format == ".xlsx"){
            lines.push(['Landing Page', 'Source', 'Medium', 'Content', 'Term', 'Campaign', 'UTM']);
        }else{
            lines.push(['Landing Page', 'Source', 'Medium', 'Content', 'Term', 'Campaign', 'UTM'].join(','));
        }
        $(rawInputRows).each(function(){
            var row = [];
            var params = [];
            $(this).each(function(colNum){
                var value = this;
                var radioVal = $('#radio').prop('checked');
                var indexQ = value.indexOf("\"");
                var indexC = value.indexOf(",");
                if (radioVal){
                    value = replaceAll(value," ","_");
                }
                if (indexQ != -1 || indexC != -1){
                    throw 'fields cannot contain quotes or commas';
                }
                if (colNum != 4 && !value){
                    throw 'required fields must be complete';
                }
                if (colNum > 0 && value){
                    params.push(parameterNames[colNum-1]+'='+encodeURIComponent(value));
                }
                row.push(value);
            });
            var url = row[0] + '?' + params.join('&');
            row.push(url);
                if (format == ".xlsx"){
                    lines.push(row);
            }else{
                lines.push(row.join(','));
            }
        });
        var fileNameInput = $("#filename");
        if (format == ".xlsx"){
            var wb = new Workbook(), ws = sheet_from_array_of_arrays(lines);
            var filename = (fileNameInput.val() || fileNameInput.attr("placeholder"));
            wb.SheetNames.push(filename);
            wb.Sheets[filename] = ws;
            var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), filename + ".xlsx")
        }else{
            var csv = lines.join('\n');
            var filename = (fileNameInput.val() || fileNameInput.attr("placeholder")) + ".csv";
		  downloadData('text/csv;charset=utf-8', csv, filename);
        }
    }
    catch(e){
        alert(e)
    }
    })

    .on('click', '#save', function(s){
        if (!currentUid){
            alert("You must be logged in to save files");
            throw new Error ("You must be logged in to save files");
        }
        else{
            var fileNameInput = $("#filename");
            var filename = (fileNameInput.val() || fileNameInput.attr("placeholder"));
            var newDataRef = firebase.database().ref('utm-set/' + currentUid + '/' + filename);
            newDataRef.set({rows: getRawInputRows(),filename:filename});
            updateDropdown(currentUid, filename);
        }

    })
    .on('change', '#SelectData', function(){
        $('.container-fluid').show();
        var dataVal = $(this).val();
        firebase.database().ref('utm-set/' + currentUid + '/' + dataVal).once('value').then(function(snapshotList) {
            // snapshotList.forEach(function(usr){
                restoreRows(snapshotList.val().rows);
                $('#filename').val(snapshotList.val().filename);
            // })
        });
        updateDropdown(currentUid,dataVal);
    })
    .on('click', '#delete', function(){
        dangerous('Oh snap! Are you sure you want to delete this data set?',
            function() {
                var dataVal = $('#SelectData').val();
                if (dataVal) {
                    firebase.database().ref('utm-set/' + currentUid + '/' + dataVal).remove();
                    updateDropdown(currentUid);
                    $('.container-fluid')[0].style.display = 'none';
                }
            }
        );

    })
    .on('change', 'input', function(){
		$('#savedInput').val(JSON.stringify(getRawInputRows()));
	});
	var savedInput = $('#savedInput').val();
	if (savedInput) {
		savedInput = JSON.parse(savedInput);
        restoreRows(savedInput);
	}
});
