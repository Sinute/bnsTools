;
$(function(){
    function GetCardId(setId, cardId, number) {
	  return (~~setId << 8) + (~~cardId << 5) + ~~number;
	}
	function GetCardPosition(id) {
	  id = ~~id;
	  return {setId:(id>>8), cardId:((id&0xE0)>>5), number:(id&0x1F)};
	}
	function GetCardAttr(rawAttrs) {
	  var attrs = [];
	  for(attrId in rawAttrs) if(attrId != 0) {
	    attrs.push({attrName: data['attrs'][attrId], attrValue: rawAttrs[attrId]});
	  }
	  attrs.sort(function(a,b){
		var aValue = a.attrValue;
		var bValue = b.attrValue;
		if(a.attrName == '生命') aValue /= 10;
		if(b.attrName == '生命') bValue /= 10;
		return bValue - aValue;
	  });
	  return attrs;
	}
	function GetCardInfo(setName, setId, cardId, number, rawAttrs) {
	  var name = setName + " " + (~~cardId + 1);
	  var id = GetCardId(setId, cardId, number);
	  var attrs = GetCardAttr(rawAttrs);
	  for(var i in attrs) {
		name += ' | ' + attrs[i].attrName + ': ' + attrs[i].attrValue;
      }
	  return {name:name, id:id}
	}

    function CardsReservation(cards) {
	  var self = this;
      self.options = ko.observableArray();
	  self.selectedCardId = ko.observable();
	  self.tds = ko.observableArray();
	  for(var i in cards)
		self.options.push({'optionsText': cards[i]['name'], 'optionsValue': cards[i]['id']});
	}
	function SetEffectReservation() {
	  var self = this;
	  self.name = ko.observable();
	  self.tds = ko.observableArray();
	}
	function TotalReservation() {
	  var self = this;
	  self.tds = ko.observableArray();
	}
    function SetReservation(sets) {
      var self = this;
	  self.cards = ko.observableArray();
	  self.setEffects = ko.observableArray();
	  self.total = ko.observable(new TotalReservation());
	  var cards = {};
	  for(var setId in sets){
		for(var cardId in sets[setId]['cards']) {
		  if(cards[cardId] === undefined) cards[cardId] = [];
		  for(var i in sets[setId]['cards'][cardId])
		    cards[cardId].push(GetCardInfo(sets[setId]['info']['name'], setId, cardId, i, sets[setId]['cards'][cardId][i]));
		}
      }
	  for(var cardId in cards)
	    self.cards.push(new CardsReservation(cards[cardId]));
    }
	function TableReservation() {
      var self = this;
	  self.ths = ko.observableArray();
	  self.sets = ko.observableArray();

	  self.SelectorChangeEvent = function(){
		var pos;
		var attrs;
		var selectedCardIds = {};
		var selectedAttrIds = {};
		var tableAttrArray  = {}; 
		var tableSetCount   = {};
		for(var i in self.sets()) {
		  tableAttrArray[i] = {};
		  tableSetCount[i]  = {};
		  for(var j in self.sets()[i].cards()) {
		    self.sets()[i].cards()[j].tds.removeAll();
		    if(self.sets()[i].cards()[j].selectedCardId() !== undefined) {
			  selectedCardIds[self.sets()[i].cards()[j].selectedCardId()] = true;
		      pos = GetCardPosition(self.sets()[i].cards()[j].selectedCardId());
		      tableAttrArray[i][j] = data.sets[pos.setId].cards[pos.cardId][pos.number];
			  // set count
			  if(tableSetCount[i][pos.setId] === undefined)
			    tableSetCount[i][pos.setId] = 1;
			  else
				 tableSetCount[i][pos.setId]++;
			}
		  }
		}
		// count set effects
		var setEffects = {};
		for(var i in tableSetCount) {
		  self.sets()[i].setEffects.removeAll();
		  self.sets()[i].total().tds.removeAll();
		  for(var setId in tableSetCount[i]) {
		    if(data['sets'][setId]['info']['set'] !== undefined) {
		      for(var setCount in data['sets'][setId]['info']['set']) {
			    if(setCount <= tableSetCount[i][setId]) {
				  if(setEffects[i] === undefined) setEffects[i] = [];
				  setEffects[i].push({name: data['sets'][setId]['info']['name']+" [ "+setCount+" ]", attrs: data['sets'][setId]['info']['set'][setCount]});
				  for(var attrId in data['sets'][setId]['info']['set'][setCount])
				    selectedAttrIds[attrId] = true;
			      self.sets()[i].setEffects.push(new SetEffectReservation());
			    }
			  }
		    }
		  }
		}
		// get selectedAttrIds
		for(var cardId in selectedCardIds) {
		  pos = GetCardPosition(cardId);
		  attrs = data.sets[pos.setId].cards[pos.cardId][pos.number];
		  for(var attrId in attrs)
		    selectedAttrIds[attrId] = true;
		}
		self.ths.removeAll();
		var ths = [];
		for(var attrId in selectedAttrIds)
		  ths.push(attrId);
		var total = [];
		for(var k in ths) {
		  // create thead
		  self.ths.push(data.attrs[ths[k]]);
		  for(var i in self.sets()) {
		    if(total[i] === undefined) total[i] = [];
		    // create card attrs
		    for(var j in self.sets()[i].cards()) {
		      if(tableAttrArray[i] !== undefined && tableAttrArray[i][j] !== undefined && tableAttrArray[i][j][ths[k]] !== undefined) {
		        self.sets()[i].cards()[j].tds.push(tableAttrArray[i][j][ths[k]]);
				if(total[i][ths[k]] === undefined)
				  total[i][ths[k]] = tableAttrArray[i][j][ths[k]];
				else
				  total[i][ths[k]] += tableAttrArray[i][j][ths[k]];
		      }else{
		        self.sets()[i].cards()[j].tds.push("");
		      }
			}
			// create set effects
			for(var j in setEffects[i]) {
			  self.sets()[i].setEffects()[j].name(setEffects[i][j].name);
		      if(setEffects[i] !== undefined && setEffects[i][j]!== undefined && setEffects[i][j]['attrs'][ths[k]] !== undefined) {
			    self.sets()[i].setEffects()[j].tds.push(setEffects[i][j]['attrs'][ths[k]]);
				if(total[i][ths[k]] === undefined)
				  total[i][ths[k]] = setEffects[i][j]['attrs'][ths[k]];
				else
				  total[i][ths[k]] += setEffects[i][j]['attrs'][ths[k]];
		      }else{
		        self.sets()[i].setEffects()[j].tds.push("");
		      }
			}
			// create total
			var td = {};
			if(i == 0) {
			  if(total[i][ths[k]] !== undefined)
			    td.count = total[i][ths[k]];
			  else
			    td.count = "";
			  td.diff = "";
			  td.css = "";
			}else{
			  if(total[i][ths[k]] !== undefined)
			    td.count = total[i][ths[k]];
			  else
			    td.count = 0;
			  td.diff = td.count - self.sets()[0].total().tds()[k].count;
			  if(td.diff == 0) {
				td.diff = "";
				td.css = "";
			  }else if(td.diff > 0) {
				td.diff = "(+"+td.diff+")";
				td.css = "success";
			  }else{
			    td.diff = "("+td.diff+")";
			    td.css = "danger";
			  }
			}
			self.sets()[i].total().tds.push(td);
		  }
		}
		var cardIds = [];
		$("select.card-selector").each(function(i, e) {
		  cardIds.push($(e).val());
		});
		location.hash = cardIds.join(",");
	  };
	}
	function ProfileReservation() {
	  var self = this;
	  self.options = ko.observableArray();
	  self.selectedProfile = ko.observable();
	  for(var i = 1; i <= 5; i++)
		self.options.push({'optionsText': '配置 '+i, 'optionsValue': i});
	  self.SaveClickEvent = function(){
		var date = new Date();
		date.setTime(date.getTime()+(10*365*24*3600*1000));
		document.cookie = "profile"+self.selectedProfile()+"="+location.hash+"; expires="+date.toGMTString();
	  };
	  self.LoadClickEvent = function(){
	    var cName = "profile"+self.selectedProfile();
	    var cStart = document.cookie.indexOf(cName+"=");
		if(cStart == -1){
		  location.hash = ""; 
		}else{
		  cStart += cName.length+1;
		  var cEnd = document.cookie.indexOf(";",cStart);	
		  if(cEnd == -1) cEnd = document.cookie.length;
		  location.hash = document.cookie.substring(cStart,cEnd);
		}
	    Init();
	  }
	}
    function ViewModel() {
      var self = this;
	  self.table = ko.observable(new TableReservation());
	  self.profile = ko.observable(new ProfileReservation());
    };
    var VM = new ViewModel();
	for(var i = 0; i < 2; i++)
	  VM.table().sets().push(new SetReservation(data['sets']));
    ko.applyBindings(VM);
    $("select").select2();
	function Init() {
	  var hash = [];
	  var selectLength = $("select.card-selector").length;
	  if(location.hash == "") {
	    for(var i = 0; i < selectLength; i++) 
		  hash.push('');
	  }else{
		hash = location.hash.substring(1).split(",");
	  }
	  for(var i in hash) {
		if(i >= selectLength) break;
		$($("select.card-selector")[i]).val(hash[i]).trigger("change");
		i++;
	  }
	}
	Init();
});
