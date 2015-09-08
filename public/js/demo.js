/**
 * Created by drouar_b on 07/09/15.
 */

$(document).ready(function() {
    $('#createForm').on('submit', function(e) {
        e.preventDefault();
        var $this = $(this);
        var value = $('#value').val();

        if(value === '') {
            alert('Les champs doivent êtres remplis');
        }
        else
        {
            $.ajax({
                url: $this.attr('action'),
                type: $this.attr('method'),
                data: $this.serialize(),
                success: function(html) {
                    if (html["status"] === "ok") {
                        addItem(html["value"], html["id"]);
                        $('#value').val('')
                    } else {
                        alert(html);
                    }
                }
            });
        }
    });
});

function addItem(value, id) {
    var list = $('#list');

    var newli = "<li class='list-group-item' id='" + id + "'>" +
                    "<div align='right' style='float:right'>" +
                        "<button class='btn btn-danger btn-xs' id='btn-" + id + "' onClick='deleteItem(this.id)'>" +
                            "Delete" +
                        "</button>" +
                    "</div>" +
                   "<div align='left'>" + value + "</div>" +
                "</li>";
    list.append(newli);

}

function deleteItem(clicked_id) {
    var id = clicked_id.substring(4);
    $.ajax({
        url: '/delete',
        type: 'get',
        data: 'id=' + id,
        success: function(html) {
            if (html["status"] === "ok") {
                var item = $('#' + html["value"]);
                item.remove();
            } else {
                alert(html)
            }
        }
    });
}