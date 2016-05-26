
if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}

$(function()
{
    $(document).on('click', '.btn-add', function(e)
    {
        e.preventDefault();

        var controlForm = $(this).parents('.controls form:first'),
            controlFormNext= $(this).nextAll('.controls form'),
            currentEntry = $(this).parents('.entry:first'),
            currentEntryNext = $(this).nextAll('.entry'),
            newEntry = $(currentEntry.clone()).appendTo(controlForm);
            newEntryNext = $(currentEntryNext.clone()).appendTo(controlFormNext);

        newEntry.find('input').val('');
        controlForm.find('.entry:not(:last) .btn-add')
            .removeClass('btn-add').addClass('btn-remove')
            .removeClass('btn-success').addClass('btn-danger')
            .html('<span class="glyphicon glyphicon-minus"></span>');
    }).on('click', '.btn-remove', function(e)
    {
		$(this).parents('.entry:first').remove();

		e.preventDefault();
		return false;
	});
});

