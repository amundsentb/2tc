$( document ).ready(function() {

  if (window.location.pathname=='/account') {
    var fileSelect = document.getElementById("fileSelect"),
      fileElem = document.getElementById("fileElem");

    fileSelect.addEventListener("click", function (e) {
      if (fileElem) {
        fileElem.click();
      }
      e.preventDefault(); // prevent navigation to "#"
    }, false);

    // If absolute URL from the remote server is provided, configure the CORS
    // header on that server.

    userb = fetch('/account/getUser',
    {
        method: "GET",
        credentials: "same-origin"
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      diplomasVar = response.profile.diplomas;
      for (var dip = 0; dip < response.profile.diplomas.length; dip++) {
        var pdfHeader = document.getElementById('pdfHeader' + dip)
        pdfHeader.innerText = response.profile.diplomas[dip].description;
        postPDF(response.profile.diplomas[dip].source, dip);
        var delPDFBtn = [];
        i = dip;
        delPDFBtn[dip] = document.getElementById('deletePDF' + dip);
        delPDFBtn[dip].addEventListener('click', function() {
          if (window.confirm('Sure you want to delete the PDF??')) {

            fetch('/deleteDiploma',
              {
                method: "POST",
                body: JSON.stringify({diploma: diplomasVar[i]}),
                headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Authorization': 'whatever-you-want',
                  'Content-Type': 'application/json'
                },
                credentials: "same-origin"
              }
            )
          //  .then(window.location.reload(false));
          }
        });
      }
      if (typeof response.profile.quals !== 'undefined') {

        if  ( typeof response.profile.quals === 'string' ) {
          arr = response.profile.quals.split(',');
        }
        for (var qual of arr) {
          anchor = document.createElement('a');

          if (qual.slice(-1) == 1) {
            addBadge(qual, 'primary');
          } else if (qual.slice(-1) == 2) {
            addBadge(qual, 'warning');
          } else if (qual.slice(-1) == 3) {
            addBadge(qual, 'success');
          } else {
          }
        }
      }
    })
  }

  else if (window.location.pathname=='/account/quals') {
    $("#treeview").hummingbird();
    $("#treeview").hummingbird("expandAll");

    userc = fetch('/account/getUser',
    {
        method: "GET",
        credentials: "same-origin"
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
        checks = response.profile.quals.split(',')
        for (var check of checks) {
          checkit = document.getElementById(check);
          checkit.checked = true;
        }
    });

    var qualList = [];

    var qualButton = document.querySelector('#qualSubmit');
    qualButton.addEventListener('click', function() {

      $("#treeview").hummingbird("getChecked",{attr:"id",list:qualList,onlyEndNodes:true});
      $("#displayItems").html(qualList.join("<br>"));
      var L = qualList.length;
      fetch("/account/quals",
      {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Authorization': 'whatever-you-want',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qualList),
          credentials: "same-origin"
      })

    });
  }

  else if (window.location.pathname=='/account/calendar') {

    userd = fetch('/account/getUser',
    {
        method: "GET",
        credentials: "same-origin"
    })
    .then(function(response) {
      return response.json();
    })
    .then(function(response) {
      $('#calendar').fullCalendar({
        events: response.calendar.free,
        eventClick: function(calEvent, jsEvent, view) {
          deleteEvent = confirm('Do you want to remove the slot?')
          if (deleteEvent) {
            delete calEvent.source;
            fetch("/account/removeAvailableSlot",
            {
                method: "POST",
                headers: {
                  'Accept': 'application/json',
                  'Authorization': 'whatever-you-want',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(calEvent),
                credentials: "same-origin"
            })
            .then(function(){
              window.location.reload(true);
            });
          }
        },
        weekNumberCalculation: "ISO",
        weekNumbers: true,
        businessHours: false,
        defaultView: 'agendaWeek',
        allDaySlot: false,
        slotDuration: '01:00:00',
        selectable: true,
        selectHelper: true,
        select: function(start, end){
          free = confirm('Do you want to set yourself available for bookings at the selected time?');
          var eventData;
          if (free) {
            eventData = {
              title: 'Available',
              start: start,
              end: end
            };
            fetch("/account/calendar",
            {
                method: "POST",
                headers: {
                  'Accept': 'application/json',
                  'Authorization': 'whatever-you-want',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
                credentials: "same-origin"
            })
            .then(function(){
              window.location.reload(true);
            });


            // $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
          }
        }
      });
    });
  }

  else if (document.location.pathname.indexOf('/users/') === 0) {
    idNumber = location.href.split('/')[4];
    usere = fetch('/getUserInfo/' + location.href.split('/')[4],
    {
      method: 'get',
      credentials: 'same-origin'
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(res) {
      $('#exampleModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        //var recipient = button.data('whatever') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
        modal.find('.modal-title').text('New message to ' + res[0].profile.name)
        modal.find('.modal-body input');
        modal.find('#recipientID').val(res[0]._id);
        modal.find('#senderID').val(res[1]._id);

      });

      userInfoPic = document.getElementById('userinfopic');
      userInfoPic.src = '../' + res[0].profile.picture;
      pdfPara = document.getElementById('pdfPara')
      for (var dip = 0; dip < res[0].profile.diplomas.length; dip++) {
        divPara = document.createElement('div');
        hPara = document.createElement('h6');
        canvasPara = document.createElement('canvas');
        hPara.id = 'pdfHeader' + dip;
        hPara.innerHTML = res[0].profile.diplomas[dip].description;
        canvasPara.id = 'the-canvas' + dip;
        divPara.appendChild(hPara);
        pdfPara.appendChild(divPara);
        pdfPara.appendChild(canvasPara);
        postPDF('../' + res[0].profile.diplomas[dip].source, dip);
      };
      $('#calendar').fullCalendar({

        events: res[0].calendar.free,

        weekNumberCalculation: "ISO",
        weekNumbers: true,
        businessHours: false,
        defaultView: 'agendaWeek',
        allDaySlot: false,
        slotDuration: '01:00:00',
        eventClick: function(calEvent, jsEvent, view) {
          userf = fetch('/account/getUser',
          {
            method: 'get',
            credentials: 'same-origin'
          })
          .then(function(response) {
            return response.json();
          })
          .then(function(response) {
            user = response;
            userinfo = res;
            book = confirm('Do you want to book the slot?')
            if (book) {
              //check if the slot is Available
              if (!calEvent.title == 'available') {
                alert('Sorry buddy. That slot is not available');
                return
              } else if (typeof user == 'undefined') {
                alert('Please log in or sign up to book a spot.');
                return
              } else {
                alert('ok!');
                delete calEvent.source;
                bookingRequest = {
                  userInfo: response,
                  user: res,
                  slot: calEvent
                };
                fetch("/account/bookSlot",
                {
                    method: "POST",
                    headers: {
                      'Accept': 'application/json',
                      'Authorization': 'whatever-you-want',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookingRequest),
                    credentials: "same-origin"
                });
              }
            }
          });
        }
      });
    });
  }

  else if (window.location.pathname=='/inbox') {
    user = fetch('/getUserAndMessages',
    {
      method: 'get',
      credentials: 'same-origin'
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(res) {
      var theMessage = [];
      for (var i = 0; i<res[1].length;i++) {
        theMessage[i] = {
          click: false,
          message: res[1][i]
        };
        addInboxRow('zeTable', theMessage[i], i);
      }
    });
  }
});


function addInboxRow(tableID, message, i) {
  // Get a reference to the table
  var tableRef = document.getElementById(tableID);

  // Insert a row in the table at row index 0
  var newRow = tableRef.insertRow(1);
  if (message.message.seen === false) 
  newRow.addEventListener('click', function() {
    if (message.click === !true) {
      message.message.seen = true;
      br = document.createElement('br');
      paragraph = document.createElement('p');
      zeMessage = document.createTextNode(message.message.body);
      zeMessage.id = 'zeM' + i;
      subjectCell.appendChild(br);
      subjectCell.appendChild(paragraph);
      subjectCell.appendChild(br);
      subjectCell.appendChild(zeMessage);
      message.click = true;
    } else {
      subjectCell.removeChild(br);
      subjectCell.removeChild(paragraph);
      subjectCell.removeChild(zeMessage);
      message.click = false;
    }
  })

  // Insert a cell in the row at index 0
  var senderCell = newRow.insertCell(0);

  // Append a text node to the cell
  var sender = document.createTextNode(message.message.sender);
  senderCell.appendChild(sender);

  var subjectCell = newRow.insertCell(1);
  subjectCell.id = 'subjectCellId';

  // Append a text node to the cell
  var subject = document.createTextNode(message.message.subject);
  subjectCell.appendChild(subject);

  var dateCell = newRow.insertCell(2);

  // Append a text node to the cell
  var date = document.createTextNode(message.message.createdAt);
  dateCell.appendChild(date);
}

function postPDF(url, canvasID) {

  var url = url || 'Conditionals – Pug.pdf';
  // var url = userb.profile.diplomas[0] + '.pdf';
  // The workerSrc property shall be specified.
  PDFJS.workerSrc = '/pdfjs-dist/build/pdf.worker.min.js';

  var pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 0.3,
      canvas = document.getElementById('the-canvas' + canvasID),
      ctx = canvas.getContext('2d');
      canvas.addEventListener('click', function() {
        window.open(url, '_blank');
      })
  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
      var viewport = page.getViewport(scale);
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function() {
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });
  }

  /**
   * Asynchronously downloads PDF.
   */
  PDFJS.getDocument(url).then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;

    // Initial/first page rendering
    renderPage(1);

  });
}

function addBadge(qual, colour) {
  badges = document.getElementById('badgeList')
  anchor = document.createElement('a');
  sumtex = document.createTextNode(qual);
  anchor.appendChild(sumtex);
  anchor.className = "badge badge-" +colour + " badge-pill";
  anchor.href = "#";
  child1 = badges.appendChild(anchor);
}
