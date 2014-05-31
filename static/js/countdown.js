var countdown = new Vue({
		el: '#countdown',
		data: {
			cmd: "",
			tasks: [],
			defaultInterval: 30,
			now: 0
		},
		methods: {
				focus: function(e) {
					e.srcElement.focus();
				},
				getTime: function() {
				  return ~~((new Date()).getTime()/1000);
				},
				cmdInput: function(e) {
				  this.cmd += '';
				  if(e.keyCode == 13) {
					  args = this.cmd.replace(/\s+/g, " ").trim().split(" ");
					  this.cmd = "";
						var isRemove = args[0].indexOf('-') == 0;
						if(isRemove) args[0] = args[0].substring(1);
						if(args[0].length == 0) return;
						var index = -1;
						for(var i in this.tasks) {
						  if(this.tasks[i].name == args[0]) {
							  index = i;
								break;
							}
						}
						// remove
						if(isRemove) {
						  if(index > -1)
						    this.tasks.splice(index, 1);
						  return;
						}
						// add
						var task = {
							'name': args[0],
							'startTime': this.getTime(),
							'interval': Number(args[1]) > 0 ? Number(args[1]) * 60 : this.defaultInterval * 60
						};
						if(index > -1)
						  this.tasks[index] = task;
						else
						  this.tasks.push(task);
					}
				}
		},
		filters: {
			timeFormat: function(time) {
			  var m = ~~(time / 60);
				var s = time % 60;
				return (m.toString().length > 1 ? '' : '0') + m.toString() + ':' + (s.toString().length > 1 ? '' : '0') + s.toString();
			}
		},
		computed: {
		  cmdLine: function(undefined) {
			  var index = document.getElementById("input").selectionStart;
				var cmdLine = "";
				var map = {
				  "&": "&amp;",
				  "<": "&lt;",
				  ">": "&gt;",
				  '"': '&quot;',
			    "'": '&#39;',
			    "/": '&#x2F;',
					" ": '&nbsp;',
					"\t": '&nbsp;'
				}
			 	if(this.cmd[index] == undefined)
			    cmdLine = '<div class="cursor">&nbsp;</div>';
				else
				  cmdLine = '<div class="cursor">' + this.cmd[index].replace(/[\s&<>"'\/]/g, function(s) {return map[s];}) + '</div>';
				cmdLine = this.cmd.substring(0, index).replace(/[\s&<>"'\/]/g, function(s) {return map[s];}) + cmdLine + this.cmd.substring(index + 1).replace(/[\s&<>"'\/]/g, function(s) {return map[s];});
				return cmdLine;
			},
			tips: function() {
			  this.now;
				this.tasks;
			  var tips = [];
				var now = this.getTime();
			  for(var i in this.tasks) {
				  tips.push({
					  'name': this.tasks[i].name,
						'time': this.tasks[i].interval - (((this.now - this.tasks[i].startTime)%(this.tasks[i].interval)) > 0 ? ((this.now - this.tasks[i].startTime)%(this.tasks[i].interval)) : 0) 
					});
				}
				return tips.sort(function (a, b) {
				  return a['time'] > b['time'] ? 1 : -1;
				});
			}
		},
		ready: function() {
		  document.getElementById("input").focus();
		}
});
setInterval("countdown.now = ~~((new Date()).getTime()/1000);", 1000);
