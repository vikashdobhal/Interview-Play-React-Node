/**
 * Container Component to lead and manage Upcoming List state.
 */

var React = require('react');
var UpcomingList = require('../presentation/upcomingList');
var APIManager = require('../../utils');
var MyButton = require('../presentation/MyButton');
var ModalCommence = require('./ModalCommence');
var APIManager = require('../../utils');
var NProgress = require('NProgress');


var UpcomingInterviews = React.createClass({
	// Intial States
	getInitialState: function(){
		return {
			interview:{
				users:[],
				interviewer:'',
				timeOfInterview:'',				
				attributes: {
					onClick: '',
					text:'',
					color:'',
					block: null
				}
			},			
			upcomingInt:{
				users:{}
			},
			Data:[]
		}
	},
	// Runs when you hit confirm Interview.
	confirmInterview: function(){
		var that = this;
		
		var newDataConfirm = [];
		var flag = 0;
		$('#ComList').find("input").each(function(i,inp){ 
			var newConfirmInt = {
				user_id:'',
				int_id:'',
				timeOfInterview:''
			};

			if($(this).val() != '')
				{
					var currDate = new Date().getTime();
					var selectedDate = new Date($(this).val()).getTime();

					if(selectedDate>currDate)
						newConfirmInt.timeOfInterview = $(this).val();
				else
				{
					flag = 2;
					return;
				}
			}
			else
			{				
				flag = 1;
				return;
			}

			newConfirmInt.user_id = $(this).attr("data_user");
			newConfirmInt.int_id = $(this).attr("data_int");

			newDataConfirm.push(newConfirmInt);

		});
		
		
		if(flag == 1) {
			alert('Please Enter a valid date and time');
			return;
		}
		if(flag == 2) {
			alert('Please Enter a date greater that today\'s date');
			return;
		}
		if(flag == 0){


			var newUpcomingInt = this.state.upcomingInt;
			var newData = this.state.Data;
			

			APIManager.post('/api/intPlay/', newDataConfirm, function(res){
				console.log(res);
				res.result.forEach(function(user,i){
					APIManager.get('/api/users/'+user.user_id, null,  function(res) {
						newUpcomingInt.users[i] = res.result ;
						newUpcomingInt.users[i].timeOfInterview = user.timeOfInterview;

						APIManager.get('/api/int/'+user.int_id, null,  function(res) {
							newUpcomingInt.users[i].interviewer = res.result;  

							newData.push(newUpcomingInt.users[i]);
							$('#modal-commence').modal('hide'); 
							$('#drop-zone-can').html('Drag and Drop Candidates'); 
							$('#drop-zone-int').html('Drag and Drop interviewer'); 
							that.setState({
								Data: newData
							})
							
						});

					});
				});	
			});			
		}
	},
	// Runs when you hit Commence Interview.
	commenceInterview: function(){
		var IDs_users = [];
		var ID_int;		
		var that = this;
		
		$("#drop-zone-can").find("li").each(function(){ IDs_users.push(this.id); });
		$("#drop-zone-int").find("li").each(function(){ ID_int = this.id; });
		if(IDs_users.length < 1)
		{
			alert('Add atleast one candidate');
			return;
		}
		if(ID_int == undefined)
		{
			alert('Add atleast one interviewer');
			return;
		}
		var newInterview = {
			users:[],
			interviewer:'',				
			attributes: {
				onClick: this.confirmInterview,
				text:'Confirm',
				color:'btn-primary',
				block: null
			}
		};

		NProgress.start();  
		NProgress.set(0.6); 

		IDs_users.forEach(function(user,i){
			
			
			APIManager.get('/api/intPlay/?user_id='+user, null, function(res){

				if(res.results.length>0){			 			
					
					APIManager.get('/api/users/'+user, null,  function(res) {
						alert('Added candidate ['+(res.result.name.first+' '+res.result.name.last)+'] has already been assigned an Interview!! Please remove and add another.');
						NProgress.done(); 
					});

					return;
				}
				
				APIManager.get('/api/users/'+user, null,  function(res) {
					newInterview.users.push(res.result);	 
					
					APIManager.get('/api/int/'+ID_int, null,  function(res) {
						newInterview.interviewer = res.result;     

						that.setState({
							interview: newInterview
						})  	
						$('#modal-commence').modal('show'); 	
						NProgress.done(); 			
					});
				});			
			});

		});
		
		
	},
	// Initialize Upcoming List
	componentDidMount: function(){
		var that = this;
		var newUpcomingInt = this.state.upcomingInt;

		var newData = this.state.Data;
		NProgress.start();  
		NProgress.set(0.6); 

		APIManager.get('/api/intPlay/', null, function(res){
			console.log(res);	

			if(res.results.length>0) {

				res.results.forEach(function(user,i){
					APIManager.get('/api/users/'+user.user_id, null,  function(res) {
						//BugFixed
						if(res.result != null) {
							newUpcomingInt.users[i] = res.result ;
							newUpcomingInt.users[i].timeOfInterview = user.timeOfInterview;

							APIManager.get('/api/int/'+user.int_id, null,  function(res) {
								newUpcomingInt.users[i].interviewer = res.result;  

								newData.push(newUpcomingInt.users[i]);
							//console.log(newData);
							that.setState({
								Data: newData
							})
							NProgress.done(); 

						});
						}

					});				


				});	
			}
			

			NProgress.done(); 

		});
		
	},
	render: function(){
		// attibutes for MyButton
		var attrib = {
			onClick: this.commenceInterview,
			text:'Commence Interview',
			color:'btn-success',
			block: null
		};
		return (<div className="row text-center">

					<MyButton attributes= {attrib}/>
					<br/>
                     <div className="col-xs-12 col-md-12">
                        <div className="panel panel-default" data-step="8" data-intro="Upcoming Interviews are displayed here.">
                           <div className="panel-heading c-list text-center">
                              <span className="title">Upcoming Interviews</span>
                             
                           </div>                           

                           <ul className="list-group" id="contact-list3">
                              <UpcomingList listData = {this.state.Data} listType = {'upcomingList'} />
                              <ModalCommence listData = {this.state.interview}/>
                           

                           </ul>
                        </div>
                     </div>
                 
				</div>);
	}


	});


module.exports = UpcomingInterviews;