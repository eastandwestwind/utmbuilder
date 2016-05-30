
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
$(function()
{ 
    $(document)
    .on('click', '.btn-add', function(e)
    {
        e.preventDefault();
        console.log("button logic function")
        var currentEntry = $(this).closest('.row');
        $(currentEntry).after(currentEntry.clone());

        // controlForm.find('.entry:not(:last) .btn-add')
        //     .removeClass('btn-add').addClass('btn-remove')
        //     .removeClass('btn-success').addClass('btn-danger')
        //     .html('<span class="glyphicon glyphicon-minus"></span>');
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
        var parameterNames = ['utm_campaign', 'utm_medium', 'utm_source', 'utm_content', 'utm_term'];
        var lines = [];
        lines.push(['Landing Page', 'Campaign', 'Medium', 'Source', 'Content', 'Term', 'URL'].join(','));
        $('.row').each(function(){
            var row = [];
            var params = [];
            $(this).find('input').each(function(colNum){
                var value = $(this).val().trim();
                if (colNum < 4 && !value){
                    throw 'required fields must be complete';
                }
                if (colNum > 0 && value){          
                    params.push(parameterNames[colNum-1]+'='+encodeURIComponent(value));
                }
                row.push(value);
            });
            var url = row[0] + '?' + params.join('&');
            row.push(url);
            lines.push(row.join(','));
        });
        var csv = 'data:text/csv;charset=utf-8,' + lines.join('\n');
        var encodedUri = encodeURI(csv);
        window.open(encodedUri);
    }
    catch(e){
        alert(e)
    }
    });
});

