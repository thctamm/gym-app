// create a window and view for index
var indexWin = Titanium.UI.createWindow({
    backgroundColor:'#F2F2F2',
    layout:'vertical',
    title: 'G.Y.M.'
});

var indexView = Titanium.UI.createScrollView({
    scrollType:"vertical",
    left:'0dp',
    top: 0,
    height: '100%',
    width:'100%'
});

// create a menu for droid
if (Ti.Platform.osname == "android") 
{
	indexWin.addEventListener('open', function(e) {
    	var activity = indexWin.activity;
	  
	    // Menu Item Specific Code
	    activity.onCreateOptionsMenu = function(e) {
	        var menu = e.menu;
	         
	        // Menu Item 1
	        var menuItem1 = menu.add({
	            title : "Add exercise",
	            showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
	        });
	        menuItem1.addEventListener("click", function(e) {
	            var addView = Alloy.createController('add', {db:db}).getView();
	        });   
	    };  
	});
}
// button for new workout
var newBut = $.UI.create('Button', {
    top: 10,
    title: 'New Workout',
    id: 'button'
});

newBut.addEventListener('click', function(e) {
	newWorkout();
});


// button for continuing workout
var continueBut = $.UI.create('Button', {
    top: 10,
    title: 'Continue Workout',
    id: 'button'
});

continueBut.addEventListener('click', function(e) {
	resume();
});

// button for looking at past workouts
var pastBut = $.UI.create('Button', {
    top: 60,
    title: 'Past Workouts',
    id: 'button'
});

pastBut.addEventListener('click', function(e) {
	var pastView = Alloy.createController('past', {db:db}).getView();
});

// button for ending a workout
var endBut = $.UI.create('Button', {
    top: 210,
    title: 'End Workout',
    id: 'button'
});  

endBut.addEventListener('click', function(e) {
	end_workout();
});

// button for stats
var statsBut = $.UI.create('Button', {
    top: 110,
    title: 'Statistics',
    id: 'button'
});

statsBut.addEventListener('click', function(e) {
	var statsView = Alloy.createController('statistics', {db:db}).getView();
});

var graphBut = $.UI.create('Button', {
    top: 160,
    title: 'Graph',
    id: 'button'
});

graphBut.addEventListener('click', function(e) {
	var graphView = Alloy.createController('graph', {db:db}).getView();
});

// open the database
var db = Ti.Database.install('/database.db', 'gymdatabase');

// get the last workout id if the last workout was started within 2 and a half hours
var workout_id;
var last_id = db.execute('SELECT * FROM current');
if (last_id.isValidRow())
{
	// get the start time for the last workout
	var start = db.execute('SELECT timestamp from workouts where id = ?', last_id.fieldByName('current_workout'));
	if (start.isValidRow())
	{
		// calculate the time difference in seconds 
		var difference = db.execute("SELECT strftime('%s', datetime('now', 'localtime')) - strftime('%s',?) as diff", start.fieldByName('timestamp'));
		
		// if the time difference is less than 2.5h 
		if (difference.fieldByName('diff') <= 9000)
		{
			// set workout_id as the id of the last workout
			workout_id = last_id.fieldByName('current_workout');
		}
		
		// close the info
		difference.close();
	}
	
	// close the info
	start.close();	
}

// close  the queryd info
last_id.close();
	
function newWorkout (e)
{

	// get the last workouts id
	var workout_info = db.execute('SELECT id FROM workouts ORDER BY id DESC LIMIT 1');
	
    // set an id for the new workout
	if (workout_info.isValidRow())
	{
		workout_id = workout_info.fieldByName('id') + 1;	
	}
	
	// else if it is the very first workout
	else
	{
		workout_id = 1;
	}
	
	// close workout_info
	workout_info.close();
	
	// set the current workout_id in the database
	db.execute('DELETE FROM current');
	db.execute('INSERT INTO current (current_workout) VALUES (?)', workout_id);
	
	// open the select window passing the database into it
	var selectWin = Alloy.createController('select', {db:db, workout_id: workout_id}).getView(); 
	
	// modify the main screen
	indexView.remove(newBut);
	indexView.add(continueBut);
	indexView.add(endBut);
}

// function for resuming a workout
function resume (e)
{
	// make sure a workout has been started. (this should be redundant by now, but i'll keep it for now')
	if (typeof workout_id == 'undefined')
	{
		alert ("You haven't started a workout yet!");
	}
	else
	{
		// open the select window passing the database into it
		var selectWin = Alloy.createController('select', {db:db, workout_id: workout_id}).getView(); 
	}
}




// function for ending a workout
function end_workout (e)
{
	// delete the current workout_id from the database
	db.execute('DELETE FROM current');
	
	// modify the main screen
	indexView.remove(continueBut);
	indexView.add(newBut);
	indexView.remove(endBut);
}

// add buttons to main screen
indexView.add(pastBut);
indexView.add(statsBut);
indexView.add(graphBut);

// if a workout hasn't been started
if (typeof workout_id == 'undefined')
{
	indexView.add(newBut);
}

// if a workout is in progress
else
{
	indexView.add(continueBut);
	indexView.add(endBut);
}

// app event listener to check if workout has been ended by clicking end workout on another screen
Ti.App.addEventListener('workout_ended', function(e){
	end_workout();
});

// open the index window
indexWin.add(indexView);
if (Ti.Platform.osname == "iphone" || Ti.Platform.osname == "ipad")
{
	var nav = Titanium.UI.iOS.createNavigationWindow({
   		window: indexWin,
   		title: "G.Y.M."
	});
	var add_exercise = Titanium.UI.createButton({title:'Add exercise'});
	    indexWin.rightNavButton = add_exercise;
	    add_exercise.addEventListener('click', function()
	    {
	      var addView = Alloy.createController('add', {db:db}).getView();
	    });
	nav.open();
}
else
{
	indexWin.open();
}
