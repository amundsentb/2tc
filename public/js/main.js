$( document ).ready(function() {

  const searchUserByQual = (e) => {

    console.log(e);

    while (userSearchList.firstChild) {
        userSearchList.removeChild(userSearchList.firstChild);
    }

    fetch('/getSearchByQual/' + e.currentTarget.id, {
      method: 'get',
      credentials: 'same-origin',
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(res) {
      res.map((user) => {
        populateUserCard(user, userSearchList);
      });
    })
  }



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
      var bookedEvents = response.calendar.free.filter(event => event.booked === true);
      var freeEvents = response.calendar.free.filter(event => !~bookedEvents.indexOf(event));
      bookedEvents.map(event => event.title = 'booked!');
      bookedEvents.map(event => event.editable = false);

      $('#calendar').fullCalendar({

        eventSources: [{
          events: freeEvents
        },
        {
          events: bookedEvents,
          color: 'red'
        }],
        eventClick: function(calEvent, jsEvent, view) {
          if (calEvent.editable !== false) {
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
          } else {
            alert('no can do hombre. Talk to the person directly pls');
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
        modal.find('#senderName').val(res[1].profile.name);

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
      var bookedEvents = res[0].calendar.free.filter(event => event.booked === true);
      var freeEvents = res[0].calendar.free.filter(event => !~bookedEvents.indexOf(event));
      bookedEvents.map(event => event.title = 'booked!');
      bookedEvents.map(event => event.editable = false);

      $('#calendar').fullCalendar({

        eventSources: [{
          events: freeEvents
        },
        {
          events: bookedEvents,
          color: 'red'
        }],


        weekNumberCalculation: "ISO",
        weekNumbers: true,
        businessHours: false,
        defaultView: 'agendaWeek',
        allDaySlot: false,
        slotDuration: '01:00:00',
        eventClick: function(calEvent, jsEvent, view) {
          console.log('hi there')
          userf = fetch('/account/getUser',
          {
            method: 'get',
            credentials: 'same-origin'
          })
          .then(function(response) {
            if (response.redirected) {
              alert('log in pls');
              window.location = '/login';
            } else {
              console.log(response);
              return response.json()

              .then(function(response) {
                userbooker = response;
                userinfo = res;
                console.log(userinfo);
                console.log(userbooker);
                book = confirm('Do you want to book the slot?')
                if (book) {
                  //check if the slot is Available
                  if (calEvent.title !== 'Available') {
                    alert('Sorry buddy. That slot is not available');
                    return
                  } else if (typeof userbooker == 'undefined') {
                    alert('Please log in or sign up to book a spot.');
                    return
                  } else {
                    alert('ok! Request to book Sent!');
                    delete calEvent.source;
                    bookingRequest = {
                      userInfo: response,
                      user: res[0],
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
        }
      });

      if (typeof res[0].profile.quals !== 'undefined') {

        if  ( typeof res[0].profile.quals === 'string' ) {
          arr = res[0].profile.quals.split(',');
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

    });
  }

  else if (window.location.pathname=='/inbox') {
    userInbox = fetch('/getUserAndMessages',
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

  else if (window.location.pathname=='/') {

    let userCardDiv = document.getElementById('userCardsGoesHere');


    users.map((user) => {
      populateUserCard(user, userCardDiv);
    });
    /**
    each userCard in users
      .card
        img.card-img-top(src=userCard.profile.picture, href='users/' + userCard._id, alt='Card image cap', height='150', width='100')
        .card-body
          h4.card-title(href='users/' + userCard._id)= userCard.profile.name
          h6.card-subtitle.mb-2
          div(id = 'badgelist_' + userCard._id)
          p.card-text= userCard.profile.about
          p.card-text= userCard.profile.interests
          a.btn.btn-primary(href='/users/' + userCard._id) Visit

    if (typeof userCard.quals !== 'undefined') {

      if  ( typeof userCard.quals === 'string' ) {
        arr = userCard.quals.split(',');
      }
      for (var qual of arr) {
        anchor = document.createElement('a');

        if (qual.slice(-1) == 1) {
          badges = document.getElementById('badgeList_')
          anchor = document.createElement('a');
          sumtex = document.createTextNode(qual);
          anchor.appendChild(sumtex);
          anchor.className = "badge badge-" +colour + " badge-pill";
          anchor.href = "#";
          child1 = badges.appendChild(anchor);
        } else if (qual.slice(-1) == 2) {
          addBadge(qual, 'warning');
        } else if (qual.slice(-1) == 3) {
          addBadge(qual, 'success');
        } else {
        }
      }
    } */


  }

  else if (window.location.pathname=='/search') {

    const userSearchByNameInput = document.getElementById('userSearchByNameInput');
    const userSearchByNameBtn = document.getElementById('userSearchByNameBtn');
    const userSearchByNameList = document.getElementById('userSearchByNameList');

    userSearchByNameBtn.addEventListener('click', function() {

      console.log(userSearchList);

      while (userSearchList.firstChild) {
          userSearchList.removeChild(userSearchList.firstChild);
      }

      fetch('/getSearchByUserName/' + userSearchByNameInput.value, {
        method: 'get',
        credentials: 'same-origin',
      })
      .then(function(res) {
        console.log(res);
        return res.json();
      })
      .then(function(res) {
        res.map((user) => {
          populateUserCard(user, userSearchList);
        });
      });
    });

    const math1Btn = document.getElementById('math1Btn');
    const math2Btn = document.getElementById('math2Btn');
    const math3Btn = document.getElementById('math3Btn');
    const phys1Btn = document.getElementById('phys1Btn');
    const phys2Btn = document.getElementById('phys2Btn');
    const phys3Btn = document.getElementById('phys3Btn');
    const chem1Btn = document.getElementById('chem1Btn');
    const chem2Btn = document.getElementById('chem2Btn');
    const chem3Btn = document.getElementById('chem3Btn');
    const salsa1Btn = document.getElementById('salsa1Btn');
    const salsa2Btn = document.getElementById('salsa2Btn');
    const salsa3Btn = document.getElementById('salsa3Btn');
    const painting1Btn = document.getElementById('painting1Btn');
    const painting2Btn = document.getElementById('painting2Btn');
    const painting3Btn = document.getElementById('painting3Btn');
    const yoga1Btn = document.getElementById('yoga1Btn');
    const yoga2Btn = document.getElementById('yoga2Btn');
    const yoga3Btn = document.getElementById('yoga3Btn');
    const football1Btn = document.getElementById('football1Btn');
    const football2Btn = document.getElementById('football2Btn');
    const football3Btn = document.getElementById('football3Btn');
    const golf1Btn = document.getElementById('golf1Btn');
    const golf2Btn = document.getElementById('golf2Btn');
    const golf3Btn = document.getElementById('golf3Btn');
    const swimming1Btn = document.getElementById('swimming1Btn');
    const swimming2Btn = document.getElementById('swimming2Btn');
    const swimming3Btn = document.getElementById('swimming3Btn');
    const plumbing1Btn = document.getElementById('plumbing1Btn');
    const plumbing2Btn = document.getElementById('plumbing2Btn');
    const plumbing3Btn = document.getElementById('plumbing3Btn');
    const sewing1Btn = document.getElementById('sewing1Btn');
    const sewing2Btn = document.getElementById('sewing2Btn');
    const sewing3Btn = document.getElementById('sewing3Btn');
    const welding1Btn = document.getElementById('welding1Btn');
    const welding2Btn = document.getElementById('welding2Btn');
    const welding3Btn = document.getElementById('welding3Btn');


    const userSearchList = document.getElementById('userSearchList');

    math1Btn.addEventListener('click', searchUserByQual);
    math2Btn.addEventListener('click', searchUserByQual);
    math3Btn.addEventListener('click', searchUserByQual);
    phys1Btn.addEventListener('click', searchUserByQual);
    phys2Btn.addEventListener('click', searchUserByQual);
    phys3Btn.addEventListener('click', searchUserByQual);
    chem1Btn.addEventListener('click', searchUserByQual);
    chem2Btn.addEventListener('click', searchUserByQual);
    chem3Btn.addEventListener('click', searchUserByQual);
    salsa1Btn.addEventListener('click', searchUserByQual);
    salsa2Btn.addEventListener('click', searchUserByQual);
    salsa3Btn.addEventListener('click', searchUserByQual);
    painting1Btn.addEventListener('click', searchUserByQual);
    painting2Btn.addEventListener('click', searchUserByQual);
    painting3Btn.addEventListener('click', searchUserByQual);
    yoga1Btn.addEventListener('click', searchUserByQual);
    yoga2Btn.addEventListener('click', searchUserByQual);
    yoga3Btn.addEventListener('click', searchUserByQual);
    football1Btn.addEventListener('click', searchUserByQual);
    football2Btn.addEventListener('click', searchUserByQual);
    football3Btn.addEventListener('click', searchUserByQual);
    golf1Btn.addEventListener('click', searchUserByQual);
    golf2Btn.addEventListener('click', searchUserByQual);
    golf3Btn.addEventListener('click', searchUserByQual);
    swimming1Btn.addEventListener('click', searchUserByQual);
    swimming2Btn.addEventListener('click', searchUserByQual);
    swimming3Btn.addEventListener('click', searchUserByQual);
    plumbing1Btn.addEventListener('click', searchUserByQual);
    plumbing2Btn.addEventListener('click', searchUserByQual);
    plumbing3Btn.addEventListener('click', searchUserByQual);
    sewing1Btn.addEventListener('click', searchUserByQual);
    sewing2Btn.addEventListener('click', searchUserByQual);
    sewing3Btn.addEventListener('click', searchUserByQual);
    welding1Btn.addEventListener('click', searchUserByQual);
    welding2Btn.addEventListener('click', searchUserByQual);
    welding3Btn.addEventListener('click', searchUserByQual);

  }

   function populateUserCard(user, userCardDiv) {
     console.log('hi');
     let exDiv1 = document.createElement('div');
     exDiv1.setAttribute('class', 'card');
     let exCardImg1 = document.createElement('img')
     exCardImg1.setAttribute('class', 'card-img-top');
     exCardImg1.setAttribute('src', user.profile.picture);
     exCardImg1.setAttribute('href', 'users/' + user._id);
     exCardImg1.setAttribute('alt', 'card image cap');
     exCardImg1.setAttribute('height', '150');
     exCardImg1.setAttribute('width', '100');
     exDiv1.appendChild(exCardImg1);
     let exCardBody = document.createElement('div');
     exCardBody.setAttribute('class', 'card-body');
     let exh4 = document.createElement('h4');
     exh4.setAttribute('class', 'card-title');
     exh4.setAttribute('href', 'users/' + user._id);
     exh4.innerHTML = user.profile.name;
     let exh6 = document.createElement('h6');
     exh6.setAttribute('class', 'card-subtitle');
     exh6.setAttribute('class', 'mb-2');

     let exBadgeList = document.createElement('div')
     if (typeof user.profile.quals !== 'undefined') {

       if  ( typeof user.profile.quals === 'string' ) {
         arr = user.profile.quals.split(',');
       }
       for (var qual of arr) {
         anchor = document.createElement('a');

         if (qual.slice(-1) == 1) {
           anchor = document.createElement('a');
           sumtex = document.createTextNode(qual);
           anchor.appendChild(sumtex);
           anchor.className = "badge badge-primary badge-pill";
           anchor.href = "#";
           exBadgeList.appendChild(anchor);
         } else if (qual.slice(-1) == 2) {
           anchor = document.createElement('a');
           sumtex = document.createTextNode(qual);
           anchor.appendChild(sumtex);
           anchor.className = "badge badge-warning badge-pill";
           anchor.href = "#";
           exBadgeList.appendChild(anchor);
         } else if (qual.slice(-1) == 3) {
           anchor = document.createElement('a');
           sumtex = document.createTextNode(qual);
           anchor.appendChild(sumtex);
           anchor.className = "badge badge-success badge-pill";
           anchor.href = "#";
           exBadgeList.appendChild(anchor);
         }
       }
     }

     exAbout = document.createElement('p');
     exAbout.setAttribute('class', 'card-text');
     exAbout.innerHTML = user.profile.about;
     exInterests = document.createElement('p');
     exInterests.setAttribute('class', 'card-text');
     exInterests.innerHTML = user.profile.interests;
     exVisitBtn = document.createElement('a');
     exVisitBtn.setAttribute('class', 'btn btn-primary')
     exVisitBtn.setAttribute('href', '/users/' + user._id)
     console.log(exVisitBtn);
     exVisitBtn.innerHTML = 'Visit';
     exCardBody.appendChild(exh4);
     exCardBody.appendChild(exh6);
     exCardBody.appendChild(exBadgeList);
     exCardBody.appendChild(exAbout);
     exCardBody.appendChild(exInterests);
     exCardBody.appendChild(exVisitBtn);
     exDiv1.appendChild(exCardBody);
     userCardDiv.appendChild(exDiv1);

   }


  const headerInbox = document.getElementById('headerInbox');
  if (user !== null) {
    const getUnreads = setInterval(function(){
    fetch('/message/numberUnread', {
      method: 'get',
      credentials: 'same-origin'
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(res) {
      console.log(res);
      headerInbox.innerText = res;
    })
  }, 60000);
  }
// If you ever want to stop it...  clearInterval(requestLoop)

});


function addInboxRow(tableID, message, i) {
  // Get a reference to the table
  var tableRef = document.getElementById(tableID);

  // Insert a row in the table at row index 0
  var newRow = tableRef.insertRow(1);



  // Insert a cell in the row at index 0
  var senderCell = newRow.insertCell(0);

  // Append a text node to the cell
  var sender = document.createTextNode(message.message.senderName);


  senderCell.appendChild(sender);

  var subjectCell = newRow.insertCell(1);


  // Append a text node to the cell
  var subject = document.createTextNode(message.message.subject);
  subjectCell.appendChild(subject);

  var dateCell = newRow.insertCell(2);

  // Append a text node to the cell
  var date = document.createTextNode(moment(message.message.createdAt).format("llll"));
  dateCell.appendChild(date);

  if (message.message.seen === false) {
    newRow.setAttribute('class', 'table-primary');

  }

  newRow.addEventListener('click', function(e) {
    if (message.click === !true) {
      fetch("/message/" + message.message._id + "/seen/" + true,
      {
          method: "PUT",
          headers: {
            'Accept': 'application/json',
            'Authorization': 'whatever-you-want',
            'Content-Type': 'application/json'
          },
          credentials: "same-origin"
      })
      .then(checkStatus);
      newRow.setAttribute('class', 'table-default');

      message.message.seen = true;
      br = document.createElement('br');
      paragraph = document.createElement('p');



      if (message.message.subject === 'Request to book available slot!' && message.message.sender === '00000000000000000000000a') {

        modifiedMessage = message.message.body.split('*');
        console.log(modifiedMessage);
        zeMessage1 = document.createTextNode(modifiedMessage[0]);
        zeMessage2 = document.createElement('a');
        userLinkName = document.createTextNode(modifiedMessage[7]);
        zeMessage2.appendChild(userLinkName);
        zeMessage2.setAttribute('href', modifiedMessage[1]);
        zeMessage3 = document.createTextNode(modifiedMessage[2]);
        slotStart = document.createTextNode(moment(modifiedMessage[3]).format("dddd, MMMM Do YYYY, h:mm:ss a"));
        zeMessage4 = document.createTextNode(modifiedMessage[4]);
        slotEnd = document.createTextNode(moment(modifiedMessage[5]).format("dddd, MMMM Do YYYY, h:mm:ss a"));
        zeMessage5 = document.createTextNode(modifiedMessage[6]);
        subjectCell.appendChild(br);
        subjectCell.appendChild(paragraph);
        subjectCell.appendChild(zeMessage1);
        subjectCell.appendChild(zeMessage2);
        subjectCell.appendChild(zeMessage3);
        subjectCell.appendChild(slotStart);
        subjectCell.appendChild(zeMessage4);
        subjectCell.appendChild(slotEnd);
        subjectCell.appendChild(zeMessage5);

        message.click = true;

        btnAcceptBooking = document.createElement('btn');
        btnAcceptBooking.innerHTML = 'confirm';
        btnAcceptBooking.setAttribute('class', 'btn btn-primary');
        subjectCell.appendChild(br);
        subjectCell.appendChild(btnAcceptBooking);
        btnRefuseBooking = document.createElement('btn');
        btnRefuseBooking.innerHTML = 'refuse';
        btnRefuseBooking.setAttribute('class', 'btn btn-primary');
        subjectCell.appendChild(btnRefuseBooking);

      } else {
        zeMessage = document.createTextNode(message.message.body);
        subjectCell.appendChild(br);
        subjectCell.appendChild(paragraph);
        subjectCell.appendChild(br);
        subjectCell.appendChild(zeMessage);
        message.click = true;


      }

    } else {
      if (message.message.subject === 'Request to book available slot!' && message.message.sender === '00000000000000000000000a' && e.target !==zeMessage2 && e.target !== btnAcceptBooking && e.target !== btnRefuseBooking) {

        while (subjectCell.firstChild) {
            subjectCell.removeChild(subjectCell.firstChild);
        }
        subjectCell.appendChild(subject);

        message.click = false;

      } else if (e.target !==zeMessage2 && e.target !== btnAcceptBooking && e.target !== btnRefuseBooking){
        subjectCell.removeChild(br);
        subjectCell.removeChild(paragraph);
        subjectCell.removeChild(zeMessage);
        message.click = false;

      } else if (e.target === btnAcceptBooking){
        console.log(modifiedMessage[8]);
        fetch('/booking/' + modifiedMessage[8] + '/booked/' + true,
        {
            method: "PUT",
            headers: {
              'Accept': 'application/json',
              'Authorization': 'whatever-you-want',
              'Content-Type': 'application/json'
            },
            credentials: "same-origin"
        })
        .then(alert('ok! Booking accepted'))

      } else if (e.target === btnRefuseBooking) {
        fetch('/booking/' + modifiedMessage[8] + '/booked/' + false,
        {
            method: "PUT",
            headers: {
              'Accept': 'application/json',
              'Authorization': 'whatever-you-want',
              'Content-Type': 'application/json'
            },
            credentials: "same-origin"
        })
        .then(alert('ok! booking refused'))
      }
    }
  })

}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
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
