$(document).ready(function(){
    loadTask();
    
    function addtodotask(){
        let todotask = $(".taskinput").val();

        if(todotask === ""){
            alert("First Enter Your Task!!");
            return;
        }

        let todop = $("<p class='d-flex justify-content-center px-5 align-items-center todop' id='todop'> <span class='three-state-toggle-button'> <button type='button' class='toggle-button pending-btn' value='Pending' style='background: red;'> </button> <button type='button' class='toggle-button ongoing-btn' value='Ongoing' ></button> <button type='button' class='toggle-button completed-btn' value='completed' ></button></span> <span class='todo-text ms-5'>"+ todotask + "</span> <span  class='ms-auto timer'>0:0:0</span> </p>");
        let updateButton = $("<button class='btn btn-success btn-sm ms-auto update-btn'>Update</button>");
        let deleteButton = $("<button class='btn btn-danger btn-sm ms-3 delete-btn'>Delete</button>");

        todop.data("starttimer", null);
        todop.data("endtimer", null);
        todop.data("timeout", null);

        todop.append(updateButton , deleteButton);
        $("#todotext").append(todop);

        setstateafterload(todop);

        savetasktolocalstorage();
        $(".taskinput").val("");
    }

    // ......... FOR STATE CHANGE AFTER LOAD OR REFRESH THE PAGE ...........

    function setstateafterload(todop) {
        let pendingBtn = todop.find('.pending-btn');
        let ongoingBtn = todop.find('.ongoing-btn');
        let completedBtn = todop.find('.completed-btn');
        let updateButton = todop.find('.update-btn');
        let deleteButton = todop.find('.delete-btn');

        if (pendingBtn.css("background-color") === "rgb(255, 0, 0)") {
            updateButton.prop('disabled', false).css('cursor', 'pointer');
            deleteButton.prop('disabled', false).css('cursor', 'pointer');
        } else if (ongoingBtn.css("background-color") === "rgb(255, 165, 0)") {
            updateButton.prop('disabled', true).css('cursor', 'not-allowed');
            deleteButton.prop('disabled', true).css('cursor', 'not-allowed');
        } else if (completedBtn.css("background-color") === "rgb(0, 128, 0)") {
            updateButton.prop('disabled', true).css('cursor', 'not-allowed');
            deleteButton.prop('disabled', false).css('cursor', 'pointer');
        }
    }


    $("#addbutton").click(addtodotask)
    updatelocalstoragetask()

    // ......FUNCTIONALITY OF UPDATE BUTTON..............
    $(document).on('click', '.update-btn', function () {
        let updateButton = this;
        let todoItem = $(updateButton).closest('p');

        Swal.fire({
            title: "An input!",
            text: "update Your Task",
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Update",
            confirmButtonColor: "green",
            preConfirm: (inputValue) => {
                if (inputValue === "") {
                    Swal.showValidationMessage("You need to write something!");
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                $(todoItem).find('.todo-text').text(result.value);
                Swal.fire("Updated!", "Task has been updated to: " + result.value, "success");
            }

            savetasktolocalstorage();
        });
    })

    // .......................... FUNCTIONALITY OF DELETE BUTTON...............
    $(document).on('click', '.delete-btn', function () {
        let deleteButton = this;
        swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this Task!",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "red",
            cancelButtonText: "cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                $(deleteButton).parent('').remove();
                swal.fire("Deleted!", "Task is deleted!!", "success");
            } 
            else {
                swal.fire("Cancelled", "Your Task is safe!", "error");
            }

            savetasktolocalstorage();
        });
    });

    // ...................... ADD STRIKE ON COMPLETD TASK ..................

    $(document).on('click' , '.completed-btn' , function(){
        if ($(this).closest("p").find('.ongoing-btn').css("background-color") === "rgb(255, 165, 0)") {
            $(this).closest("p").find('.todo-text').addClass("strike").css({ "color": "gray" });
        }
        else{
            alert("Complete the ongoing state before moving to Completed.");
        }
        savetasktolocalstorage();
    })
    
    $(document).on("click", ".ongoing-btn, .pending-btn", function () {
        $(this).closest("p").find('.todo-text').removeClass("strike").css({ "color": "black" });

        savetasktolocalstorage();
    });

    // ............ FOR COLOR CHANGE OF TOGGLE AND DISABLE FUNCTIONALITY .....................

    $(document).on("click", ".pending-btn", function () {
        let updateButton = $(this).closest("p").find('.update-btn');
        let deleteButton = $(this).closest("p").find('.delete-btn');

        $(this).css({ "background-color": "red"});
        $(this).closest("p").find(".ongoing-btn, .completed-btn").css({ "background-color": "black" });

        updateButton.prop('disabled', false).css('cursor', 'pointer');
        deleteButton.prop('disabled', false).css('cursor', 'pointer');

        savetasktolocalstorage();
   });

   $(document).on("click", ".ongoing-btn", function () {
       let updateButton = $(this).closest("p").find('.update-btn');
       let deleteButton =$(this).closest("p").find('.delete-btn');

        $(this).css({ "background-color":"orange"  });
        $(this).closest("p").find(".pending-btn, .completed-btn").css({ "background-color": "black" });

        updateButton.prop('disabled', true).css('cursor', 'not-allowed');
        deleteButton.prop('disabled', true).css('cursor', 'not-allowed');

        savetasktolocalstorage();
   });

    $(document).on("click", ".completed-btn", function () {
        let updateButton = $(this).closest("p").find('.update-btn');
        let deleteButton = $(this).closest("p").find('.delete-btn');

        if ($(this).closest("p").find('.ongoing-btn').css("background-color") === "rgb(255, 165, 0)") {
            $(this).css({ "background-color": "green" });
            $(this).closest("p").find(".pending-btn, .ongoing-btn").css({ "background-color": "black" });

            updateButton.prop('disabled', true).css('cursor', 'not-allowed');
            deleteButton.prop('disabled', false).css('cursor', 'pointer');

        }
        else{
            $(this).closest("p").find(".completed-btn").css({ "background-color": "black" });

        }
        savetasktolocalstorage();
    });

    // ........................FOR STORE TASK IN LOCALSTORAGE......................

    function savetasktolocalstorage(){
        let todolist = []

        $("#todotext p").each(function(index){
            let task = $(this).find(".todo-text").text().trim();
            let Pending = $(this).find('.pending-btn').css("background-color") === "rgb(255, 0, 0)";
            let Ongoing = $(this).find('.ongoing-btn').css("background-color") === "rgb(255, 165, 0)";
            let Completed = $(this).find('.completed-btn').css("background-color") === "rgb(0, 128, 0)";
            let starttimer = $(this).data("starttimer");
            let endtimer = $(this).data("endtimer");
            let timerValue = $(this).find('.timer').text();

            if (Ongoing === true && starttimer === null) {
                 starttimer = moment().valueOf();
            }

            if (Completed === true && endtimer === null) {
                 endtimer = moment().format('hh:mm:ss A');
            }
            
            let duration = Duration($(this).data("starttimer"), $(this).data("endtimer"));
            document.getElementsByClassName("timer").innerHTML = duration

            todolist.push({
                id : index + 1,
                task: task,             
                Pending : Pending,
                Ongoing : Ongoing,
                Completed : Completed,
                starttimer: moment(starttimer).format('hh:mm:ss A'),
                endtimer: endtimer,
                duration: duration,
                timerValue: timerValue
            })
        })

        localStorage.setItem("todo-details", JSON.stringify(todolist));
   }

//    ......................... FOR LOAD TASK WHEN PAGE LOAD..........................
    function loadTask(){
        if (localStorage.getItem("todo-details")) {
            let todolist = JSON.parse(localStorage.getItem("todo-details"));

            todolist.forEach(todo => {
                let todop = $("<p id='todop' class='d-flex justify-content-center px-5 align-items-center todop'> <span class='three-state-toggle-button'> <button type='button' class='toggle-button pending-btn' value='Pending' > </button> <button type='button' class='toggle-button ongoing-btn' value='Ongoing'></button> <button type='button' class='toggle-button completed-btn' value='completed'></button></span> <span class='todo-text ms-5'>" + todo.task + "</span> <span class='ms-auto timer'>" + todo.duration + "</span> </p>");
                let updateButton = $("<button class='btn btn-success btn-sm ms-auto update-btn'>Update</button>");
                let deleteButton = $("<button class='btn btn-danger btn-sm ms-3 delete-btn'>Delete</button>");

                if (todo.Pending) {
                    todop.find('.pending-btn').css({ "background-color": "red" });  
                    todop.find(".timer").text("0:0:0")
               
                }

                if (todo.Ongoing) {
                    todop.find('.ongoing-btn').css({ "background-color": "orange" }); 
                    let starttimer = new Date().getTime() - timerfunction(todo.timerValue);
                    stopwatch(todop.find('.ongoing-btn'), starttimer);         
                }

                if (todo.Completed) {
                    todop.find('.completed-btn').css({ "background-color": "green" });
                    todop.find('.todo-text').addClass('strike').css({"color" : "gray"});
                }
    

                todop.append(updateButton, deleteButton);
                $("#todotext").append(todop);

                setstateafterload(todop);
            });
        }

    }

    // .................. FOR UPDATE IN LOCALSTORAGE..................
    function updatelocalstoragetask(){
        let storedtodotasks = JSON.parse(localStorage.getItem('todo-details'))

        if(storedtodotasks) {
            let todolist = storedtodotasks;

            $("#todotext").empty();
            todolist.forEach(todo => {
                let todop = $("<p id='todop' class='d-flex justify-content-center px-5 align-items-center todop'> <span class='three-state-toggle-button'> <button type='button' class='toggle-button pending-btn' value='Pending'> </button> <button type='button' class='toggle-button ongoing-btn' value='Ongoing' ></button> <button type='button' class='toggle-button completed-btn' value='completed'></button></span> <span class='todo-text ms-5'>"+ todo.task + "</span><span class='ms-auto timer'>" + todo.duration + "</span></p>");
                let updateButton = $("<button class='btn btn-success btn-sm ms-auto update-btn'>Update</button>");
                let deleteButton = $("<button class='btn btn-danger btn-sm ms-3 delete-btn'>Delete</button>");

                if(todo.Pending) {
                    todop.find('.pending-btn').css({ "background-color": "red" });
                    todop.find(".timer").text("0:0:0")
                }

                if(todo.Ongoing) {
                    todop.find('.ongoing-btn').css({"background-color" : "orange"});
                    let starttimer = new Date().getTime() - timerfunction(todo.timerValue);
                    stopwatch(todop.find('.ongoing-btn'), starttimer);
                }

                if(todo.Completed) { 
                    todop.find('.completed-btn').css({"background-color" : "green"});
                    todop.find('.todo-text').addClass('strike').css({"color" : "gray"});
                }
                if (todo.timerValue) {
                    todop.find('.timer').text(todo.timerValue);
               }

                todop.append(updateButton , deleteButton);
                $("#todotext").append(todop);

                setstateafterload(todop);
            });
        }
    }

    // .................... FILTER FUNCTIONALITY....................
    $("#filter-all").click(function () {
        $("p").removeClass("d-none").show();
    });

    $("#filter-pending").click(function () {
        $("p").each(function () {
            if ($(this).find('.pending-btn').css("background-color") === "rgb(255, 0, 0)") {
                $(this).removeClass("d-none");
            } else {
                $(this).addClass("d-none");
            }
        });
    });
    
    $("#filter-ongoing").click(function () {
        $("p").each(function () {
            if ($(this).find('.ongoing-btn').css("background-color") === "rgb(255, 165, 0)") {
                $(this).removeClass("d-none");
            } else {
                $(this).addClass("d-none");
            }
        });
    });
    
    $("#filter-completed").click(function () {
        $("p").each(function () {
            if ($(this).find('.completed-btn').css("background-color") === "rgb(0, 128, 0)") {
                $(this).removeClass("d-none");
            } else {
                $(this).addClass("d-none");
            }
        });
    });

    // .................... DELETE ALL COMPLETED TASK.......................
    $('.delete-all-completed').click(function () {
        $("p").each(function () {
            if ($(this).find('.completed-btn').css("background-color") === "rgb(0, 128, 0)") {
                $(this).remove();
            }
        });
    
        swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this Task!",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "red",
            cancelButtonText: "cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                swal.fire("Deleted!", "Completed tasks are deleted!!", "success");
                savetasktolocalstorage();
            } else {
                swal.fire("Cancelled", "Your Task is safe!", "error");
            }
        });
    });

    // ...................... DELETE ALL TASK.....................
    $(".delete-all").click(function () {
        $("#todotext").empty();

        swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this Task!",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "red",
            cancelButtonText: "cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                swal.fire("Deleted!", "Completed tasks are deleted!!", "success");
                savetasktolocalstorage();
            } else {
                swal.fire("Cancelled", "Your Task is safe!", "error");
            }
        });
    });


    // .................. CHAGE DARK-LIGHT MODE FUNCTIONALITY.............
    $( ".changemode" ).on("click", function() {
        if( $( "body" ).hasClass( "dark" )) {
            $( "body" ).removeClass( "dark" );
            $( ".changemode" ).text( "OFF" );
        } else {
            $( "body" ).addClass( "dark" );
            $( ".changemode" ).text( "ON" );
        }
    });


    // ...................TIMER FUNCTIONALITY...................

    $(document).on("click", ".ongoing-btn", function () {
        let starttimer = moment();
        stopwatch($(this), starttimer);
    });

    function stopwatch(element, starttimer) {
        let timeout = setTimeout(function () {
             if (starttimer) {
                  let currentTime = moment();
                  let totaltime = currentTime.diff(starttimer, 'hh:mm:ss A');
                  let duration = moment.duration(totaltime);

                  let hours = Math.floor(duration.asHours());
                  let minutes = Math.floor(duration.asMinutes()) % 60;
                  let seconds = Math.floor(duration.asSeconds()) % 60;

                  element.closest("p").find('.timer').text(`${hours}:${minutes}:${seconds}`);
                  element.closest("p").data("endtimer", moment().format('hh:mm:ss A'));
                  stopwatch(element, starttimer);
                  savetasktolocalstorage()
             }
        }, 1000);

        element.closest("p").data("starttimer", starttimer);
        element.closest("p").data("timeout", timeout);
    }
    
    $(document).on("click", ".completed-btn", function () {
        clearTimeout($(this).closest("p").data("timeout"));
        $(this).closest("p").data("starttimer");
    });

    $(document).on("click", ".pending-btn", function () {
        clearTimeout($(this).closest("p").data("timeout"));
        resetStopwatch($(this));
        $(this).closest("p").data("starttimer", null);
    });

    function resetStopwatch(element) {
        element.closest("p").find('.timer').text("0:0:0");
    } 
    
    function Duration(starttimer, endtimer) {
        if (starttimer && endtimer) {
            let start = moment(starttimer);
            let end = moment(endtimer, 'hh:mm:ss A');

            let duration = end.diff(start, 'seconds');
            if (duration < 0) {
                  return "0:0:0";
             }

            let hours = Math.floor(duration / 3600);
            let minutes = Math.floor((duration % 3600) / 60);
            let seconds = duration % 60;

             return `${hours}:${minutes}:${seconds}`
        }

        return "0:0:0";
   }

    function timerfunction(timerValue) {
        let [hours, minutes, seconds] = timerValue.split(':');
        return (parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)) * 1000;
    }

    

})

