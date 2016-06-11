
if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}

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
}

//on download click
$(function()
{ 
    $(document)
    .on('click', '.btn-add', function (e)
    {
        e.preventDefault();
        console.log("button logic function")
        var currentEntry = $(this).closest('.row');
        $(currentEntry).after(currentEntry.clone());
    })
    .on('click', '.btn-remove', function(e)
    {
		$(this).closest('.row').remove();

		e.preventDefault();
		return false;
    })
   .on('click', '.btn-primary', function(g)
    {
    try{
        var format = $('.selectpicker').find(":selected").text();
        var parameterNames = ['utm_source', 'utm_medium', 'utm_content', 'utm_term', 'utm_campaign'];
        var lines = [];
        if (format == ".xlsx"){
            lines.push(['Landing Page', 'Source', 'Medium', 'Content', 'Term', 'Campaign', 'UTM']);
        }else{
            lines.push(['Landing Page', 'Source', 'Medium', 'Content', 'Term', 'Campaign', 'UTM'].join(','));
        }
        $('.row').each(function(){
            var row = [];
            var params = [];
            $(this).find('input').each(function(colNum){
                var value = $(this).val().trim();
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
//            xlsx already has a placeholder filename
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
    });
});

