var React = require('react');
var MyList = require('../presentation/MyList');
var APIManager = require('../../utils');
var ModalAdd = require('./ModalAdd');
var ModalUpdate = require('./ModalUpdate');

var canList = React.createClass({

	getInitialState: function(){
		return {
			user:{
				picture:'',
				name:{
					first:'',
					last:''
				},
				company:'',
				email:'',
				phone:''
			},
			Data:[],
			id:[]
		}
	},
	checkData: function(newUser, id){
		if($('#first_name'+id).val() != '')
			newUser.name.first = $('#first_name'+id).val();
		else {
			$('#error'+id).html('Please Enter First Name');
			return false;
		}

		if($('#last_name'+id).val() != '')
			newUser.name.last = $('#last_name'+id).val();
		else {
			$('#error'+id).html('Please Enter Last Name');
			return false;
		}

		if($('#email'+id).val() != '')
			newUser['email'] = $('#email'+id).val();
		else {
			$('#error'+id).html('Please Enter Email');
			return false;
		}
		if($('#phone'+id).val() != '')
			newUser['phone'] = $('#phone'+id).val();
		else {
			$('#error'+id).html('Please Enter phone Number');
			return false;
		}

		if($('#org'+id).val() != '')
			newUser['company'] = $('#org'+id).val();
		else {
			$('#error'+id).html('Please Enter Current Org');
			return false;
		}

		if($('#picture'+id).val() != '')
			newUser['picture'] = $('#picture'+id).val();
		else {
			$('#error'+id).html('Please Enter Picture Url');
			return false;
		}
		$('#error'+id).html('');
		return true;
	},
	addCandidate: function(){
		var that = this;
		var newUser = this.state.user;
		if(!this.checkData(newUser,''))
			return;
		
		APIManager.post('/api/users/', newUser, function(res){
			console.log('results:'+ JSON.stringify(res));
			var newData = that.state.Data;
			newData.push(res.result);
			that.setState({
				Data: newData
			})
			alert('New candidate added at the bottom');
			$('#modal-add').modal('hide');
		});


	},
	updateCandidate: function(){
		var that = this;
		var id = this.state.id;
       //console.log('id:'+id);
       var newUser = this.state.user;
       if(!this.checkData(newUser,'_up'))
       	return;

       APIManager.put('/api/users/'+id, newUser, function(res){
			//console.log('results:'+ JSON.stringify(res));
			var newData = that.state.Data;
			
			for (var i=0; i<newData.length; i++) {
				if (newData[i]._id == id) {
					newData[i] = res.result;
					break;
				}
			}
			
			that.setState({
				Data: newData
			});
			console.log('User Information Updated!');
			$('#modal-update').modal('hide');
		});
   },
   deleteCandidate: function(){
   	var that = this;
   	var id = this.state.id;		
   	if (confirm('Are you sure you want to delete this candidate from database?'))
   	{
   		APIManager.delete('/api/users/'+id, function(res){
   			var newData = that.state.Data;			
   			for (var i=0; i<newData.length; i++) {
   				if (newData[i]._id == id) {
   					newData.splice(i,1);
   					break;
   				}
   			}

   			that.setState({
   				Data: newData
   			});
   			alert('Candidate Deleted!');
   			$('#modal-update').modal('hide');
   		});
   	}
   },
    showUpdateModal: function(event){
        //console.log(event.currentTarget.id);
        var id = event.currentTarget.id;
        this.state.id = id;
        
        APIManager.get('/api/users/'+id, null,  function(res) {

        	$('#first_name_up').val(res.result.name.first);
        	$('#last_name_up').val(res.result.name.last);
        	$('#email_up').val(res.result.email);
        	$('#phone_up').val(res.result.phone);
        	$('#org_up').val(res.result.company);
        	$('#picture_up').val(res.result.picture);
        	$('#modal-update').modal('show');
				
			});
    },
	componentDidMount: function(){
		
		var that = this;
		APIManager.get('/api/users/', null,  function(res) {
				that.setState({
					Data: res.results
				})
			});

	},
	render : function(){
		 var canType = 'can';
		return (<div >
                    <MyList id="candidate" listData = {this.state.Data} listType= {canType} onClick={this.showUpdateModal}/>	
							<ModalAdd onClick={this.addCandidate}/>
							<ModalUpdate onClick={this.updateCandidate} onClick_del={this.deleteCandidate}/>
					</div>
				);
	}


	});


module.exports = canList;