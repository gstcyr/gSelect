var gSelect = function(){
    var defaultOptions = {
        toggleMode : true,          // Multi-Select toggles checked values
	    allowMultiple : false,      // whether to allow multi select
	    exclusive : false,          // limit selected values to single OptGroup
	    onChange : null,             // Callback on Change
	    defaultText : '(Empty)',
	    allowGroupSelect : false,   // Makes group headers selectable. (Requires 'allowMultiple' to be true).
	    groupSelectAction : null,  // if Null, selects every item in group. If passed a function, will call the function with the optgroup name
	    size : 10,
	    smartResize : false,        // Resizes to fit parent container height
	    textField : 'text',
	    valueField : 'value',
	    groupField : 'group',
	    classField : 'class',
	    data : []
    };
    var self = {
        initialize : function(el, options){
	        this.addCSS();

            this.options = Object.create(defaultOptions);
	        for(var k in options) this.options[k] = options[k];
	        this.onChange = this.options.onChange;
	        if(self.options.smartResize){
		        window.addEventListener('resize',self.smartResize);
	        }

            el = self.$(el);
            if(!el) return null;
	        this.name = el.name;
	        this.id = el.id;
            switch(el.tagName){
                case 'SELECT':
                    this.select = el;
	                // if(this.options.allowMultiple) this.select.multiple = true;
                    this.parseSelect();
	                this.renderList(true);
                    break;
                case 'UL':
                    el.addClassName('gList');
                    this.ul = el;
                    this.parseList(el, true);
	                this.renderSelect();
	                this.renderList(true);
                    break;
	            default:
		            this.container = el;
		            this.renderSelect();
		            this.renderList(true);
            }
            return this;
        },
	    addCSS : function(){
			var links = document.getElementsByTagName('link');
		    for(var i=0; i<links.length; i++) if(links[i].href.indexOf('gSelect.css') >= 0) return;
		    var link = document.createElement('link');
		    link.href = 'gSelect/gSelect.css';
		    link.rel = 'stylesheet';
		    link.type = 'text/css';
		    document.getElementsByTagName('head')[0].appendChild(link);
	    },
	    parseJSON : function(arr){
		    self.options.data = arr;
		    self.renderSelect();
		    self.renderList();
		    return self;
	    },
	    parseSelect : function(){
		    var group, className, obj = {};
		    self.options.data = [];
		    if(self.select.size) self.options.size = self.select.size;
		    self.options.allowMultiple = self.select.multiple?true:false;

		    for(var i=0; i<self.select.options.length; i++){
			    group = null, className = null;
			    var o = self.select.options[i];
			    obj = {};
			    if(o.parentNode.tagName == 'OPTGROUP'){
					obj[self.options.groupField] = o.parentNode.label;
			    }
			    obj[self.options.classField] = o.className;
			    obj[self.options.textField] = o.text;
			    obj[self.options.valueField] = o.value;
			    self.options.data.push(obj);
		    }
	    },
   	    parseList : function(ul, top){
			var i, li, o, lis = ul.children;
		    if(top){
			    self.options.data = [];
		    }
		    for(i=0; i<lis.length; i++){
			    o = {};
			    li = lis[i];
			    var oG = li.getElementsByTagName('ul');
			    if(oG.length){
				    self.parseList(oG);
			    } else {
				    o[self.options.textField] = li.innerHTML;
				    var val = li.getAttribute(self.options.valueField);
				    o[self.options.valueField] = val!==null?val:li.innerHTML;
				    o[self.options.classField] = li.className;
				    self.options.data.push(o);
			    }
		    }
	    },
	    renderSelect : function(){
		    if(this.select){
		        this.select.innerHTML = '';
		    } else {
			    this.select = document.createElement('select');
			    this.select.name = this.name||this.id||'';
			    this.select.style.display = 'none';
			    if(this.ul){
			        this.ul.parentNode.insertBefore(this.select,this.ul);
			    } else {
				    this.container.appendChild(this.select);
			    }
		    }
		    var optgroups = {};
		    var oG, groupName;
		    var text = this.options.textField;
		    var val = this.options.valueField;
		    var group = this.options.groupField;
		    var className = this.options.classField;
		    var arr = self.options.data;
		    if(arr.length){
		    try{
			    if(typeof arr[0][val] == 'undefined') val = text;

			    for(var i=0; i<arr.length; i++){
				    var opt = new Option(arr[i][text], arr[i][val]);
				    if(arr[i][className]) opt.addClassName(arr[i][className]);
				    if(arr[i][group]){
					    groupName = arr[i][group];
					    if(!optgroups[groupName]){
						    oG = document.createElement('optgroup');
						    oG.label = groupName;
						    self.select.appendChild(oG);
						    optgroups[groupName] = oG;
					    }
					    optgroups[groupName].appendChild(opt);
				    } else {
					    self.select.appendChild(opt);
				    }
			    }
		    } catch(err){ console.log(err);}
		    }
	    },
	    renderList : function(firstRun){
			if(!self.ul){
				// create List
				self.ul = document.createElement('ul');
				self.select.parentNode.insertBefore(self.ul, self.select);
				self.select.style.display = 'none';
			}
		    if(firstRun){
			    self.ul.addClassName('gList '+self.select.className);
			    self.ul.tabIndex = 0;
			    if(self.options.allowMultiple) self.ul.setAttribute('multiple','');
			    self.ul.addEventListener('scroll',this.onScroll);
			    self.setHeight();
		    }
		    self.ul.innerHTML = '';
		    self.items = [];
		    self.groups = {};

		    if(!self.options.data.length){
				var def = document.createElement('li');
			    def.className = 'optgroup';
				def.innerHTML = self.options.defaultText;
			    self.ul.appendChild(def);
		    }

		    // Add event handlers:
		    for(var i = 0; i < self.options.data.length; i++){
			    var o = self.options.data[i];
			    var g = o[self.options.groupField];
			    var li = document.createElement('li');
			    self.items.push(li);
			    o.li = li;
			    if(g){
				    if(!self.groups[g]){
					    self.groups[g] = document.createElement('ul');
					    var gli = document.createElement('li');
					    gli.className = 'optgroup';
					    var div = document.createElement('div');
					    div.innerHTML = g;
					    if(self.options.allowGroupSelect){
					        div.className = 'selectable';
					        div.addEventListener('click', self.groupSelect.bind(div,g));
					    }
					    gli.appendChild(div);
					    gli.appendChild(self.groups[g]);
					    self.ul.appendChild(gli);
				    }
				    ul = self.groups[g];
			    } else {
					ul = self.ul;
			    }

			    li.innerHTML = o[self.options.textField];
			    li.setAttribute('value', o[self.options.valueField]);
			    if(o[self.options.classField]) li.addClassName(o[self.options.classField]);

			    ul.appendChild(li);
			    li.addEventListener('mousedown', self.onMouseDown);
			    if(self.options.allowMultiple){
				  //  var check = document.createElement('span');
				  //  check.className = 'check';
				  //  li.insertBefore(check,li.childNodes[0]);
				    li.addEventListener('mouseover', self.onHover);
				    li.addEventListener('mouseout', self.onMouseOut);
			    }
		    }

		    if(self.options.smartResize) setTimeout(function(){ self.smartResize() });

	    },
	    setHeight : function(){
		    if(!self.options.itemHeight){
			    var tmp = document.createElement('li');
			    tmp.innerHTML = "&nbsp;";
			    self.ul.appendChild(tmp);
			    self.options.itemHeight = tmp.offsetHeight;
			    tmp.parentNode.removeChild(tmp);
		    }
		    self.ul.style.height = (self.options.itemHeight * self.options.size) + 'px';

	    },
	    smartResize : function(ev){
		    // setTimeout helps with function running before screen redraws
		    setTimeout(function(){
			    var poH = self.ul.parentNode.offsetHeight;
			    var oT = self.ul.offsetTop;
			    var poT = self.ul.parentNode.offsetTop;
			    var doT = oT - poT;
			    self.options.size = ((poH - doT)/self.options.itemHeight).floor();
			    self.setHeight();
		    });
	    },
	    getValues : function(){
		    var selected = [];
			for(var i=0; i<self.select.options.length; i++){
				if(self.select.options[i].selected) selected.push(self.select.options[i].value);
			}
		    return selected;
	    },
	    groupSelect : function(optGroup){
		    if(!self.options.groupSelectAction){
				for(var i=0; i < self.options.data.length; i++){
					if(self.options.data[i][self.options.groupField] == optGroup){
						self.items[i].addClassName('selected');
						self.select.options[i].selected = true;
					}
				}
		        self.onChange(self.getValues());
		    } else {
			    self.deselect();
				this.addClassName('selected');
			    self.options.groupSelectAction(optGroup);
		    }
		},
        onScroll : function(ev){
	        if(!self.ellipses) return;
          //  console.log(self.ellipses.scrollTop, self.ellipses.y, self.ul.scrollTop);
            if(self.ellipses.div){
                // change original y?
                // update
	            var diff = self.ul.scrollTop - self.ellipses.scrollTop;
                self.ellipses.div.style.top = (self.ellipses.y - diff) + 'px';
	            //self.ellipses.div.style.x = (self.ellipses.div.offsetHeight + diff) + 'px';

            }
        },
        onKeyPress : function(ev){
             switch(ev.keyCode){
                case 40 : // keydown

                    break;
                case 38: // keyup

                    break;
                case 17: // ctrl

                    break;
                case 32: // space (toggle selected)

                    break;
                case 13: // Enter // toggle selected, next input
                    break;

            }
        },
     /*   onSelect : function(ev){
            if(self.allowMultiple)
                this.toggleClassName('selected');
            else{
                self.deselect();
                this.addClassName('selected');
            }
        }, */
        onHover : function(ev){
            for(var i=0; i<self.items.length; i++){
                self.items[i].removeClassName('hovered');
            }
            this.addClassName('hovered');
        },
        onMouseOut : function(ev){
            this.removeClassName('hovered');

        },
        onMouseDown : function(ev){
            self.clicked = this;
	        var index = Array.prototype.indexOf.call(self.items,this);
            if(!self.options.allowMultiple){
	            self.ellipses = null;
                self.deselect();
                this.addClassName('selected');
	            //self.select.Array.prototype.indexOf.call(this.parentNode.children,this));
				//self.select.setValue(this.getAttribute('value'));

	            self.select.selectedIndex = index;
	            self.value = self.select.value;
	            if(self.onChange) self.onChange(self.select.value);
            } else {
                // For drag and release:
                self.ellipses = {
                    x : ev.pageX,
                    y : ev.pageY,
                    scrollTop : self.ul.scrollTop,
                };
	            self.startGroup = null;
	            if(self.options.exclusive){
		            if(self.select.options[index].parentNode.tagName == 'OPTGROUP'){
			            self.startGroup = self.select.options[index].parentNode.label;
		            }
		            if(self.startGroup != self.lastStartGroup){
			            console.log('deselecting!');
			            self.deselect();
		            }

	            }
	           // return;
	            //self.startOptGroup =
                var div = document.createElement('div');
                div.className = 'gListEllipse';
                div.style.position = 'absolute';
                div.style.display = 'none';
                div.style.left = ev.pageX+'px';
                div.style.top = ev.pageY+'px';
                document.body.appendChild(div);
                self.ellipses.div = div;

                window.addEventListener('mouseup', self.onMouseUp);
                window.addEventListener('mousemove',self.onMouseMove);
                // End Drag and Release

                // For Shift/Ctrl Click:
                var i1,
                    i2 = Array.prototype.indexOf.call(self.items,this);
                if(self.lastSel !== null) {
                    i1 = self.lastSel;
                }
                if(!self.lastSel || !ev.shiftKey)
                    self.lastSel = i2;

                if(!ev.ctrlKey && !self.options.toggleMode){
					self.deselect();
				}

	            //if(!this.options.exclusive)
                if(ev.ctrlKey || self.options.toggleMode) this.toggleClassName('selected');
                else this.addClassName('selected');

                if(ev.shiftKey){
	                this.removeClassName('selected');
                    var c = self.items[i1].hasClassName('selected') ? true : false;
	                console.log(self.startGroup, self.lastStartGroup);
	                if(self.options.exclusive){
		                if(self.startGroup != self.lastStartGroup) self.deselect();
	                }
                    if(i1>i2) i1 = i2 + (i2=i1, 0);
                    if(i1 !== null){
                        var	y = i1>i2?-1:1;
                        for(i=i1; i<=i2; i+=y){
	                        if(self.options.exclusive){
		                        var oG = self.select.options[i].parentNode.label||null;
		                        console.log(oG);
		                        if(oG != self.lastStartGroup){
			                        continue;
		                        }
	                        }

                            if(self.options.toggleMode){
	                            if(c){
							        self.items[i].addClassName('selected');
							    } else self.items[i].removeClassName('selected');
                            } else {
	                            self.items[i].addClassName('selected');
                            }
                        }
                    }
                }
	            self.lastStartGroup = self.startGroup;

            }
        },
        onMouseUp : function(){
	        if(self.ellipses)
                self.ellipses.div.parentNode.removeChild(self.ellipses.div);
			var selected = [];

            for(var i=0; i<self.select.options.length;i++){
	            if(self.items[i].hasClassName('optgroup')) continue;
	            self.select.options[i].selected = false;
                if(self.items[i].hasClassName('highlighted')){
                    self.items[i].removeClassName('highlighted');
                    if(self.options.toggleMode){
                        if(self.clicked.hasClassName('selected')){
							self.items[i].addClassName('selected');
							self.select.options[i].selected = true;
                        } else {
							self.items[i].removeClassName('selected');
							self.select.options[i].selected = false;
						}
					} else {
                        self.items[i].addClassName('selected');
						self.select.options[i].selected = true;
					}
                } else if(self.items[i].hasClassName('selected')){
	                self.select.options[i].selected = true;
                }
	            if(self.select.options[i].selected) selected.push(self.select.options[i].value);
            }
			if(self.onChange)
				self.onChange(selected);
            window.removeEventListener('mouseup',self.onMouseUp);
            window.removeEventListener('mousemove',self.onMouseMove);
        },
        onMouseMove : function(ev){
            self.ellipses.div.style.display = '';
            if(ev.pageX > self.ellipses.x){
                self.ellipses.div.style.width = (ev.pageX - self.ellipses.x) + 'px';
            } else {
                self.ellipses.div.style.left = ev.x + 'px';
                self.ellipses.div.style.width = (self.ellipses.x - ev.pageX ) + 'px';
            }
            if(ev.pageY > self.ellipses.y){
                self.ellipses.div.style.height = (ev.pageY - self.ellipses.y) + 'px';
            } else {
                self.ellipses.div.style.top = ev.pageY + 'px';
                self.ellipses.div.style.height = (self.ellipses.y - ev.pageY ) + 'px';
            }
            for(var i=0; i<self.items.length; i++){
                if(self.hasOverlap(self.items[i],self.ellipses.div)){
	                if(self.options.exclusive){
		                var oG = self.select.options[i].parentNode.label;
		                if(oG == self.startGroup){
			                self.items[i].addClassName('highlighted');
		                }
	                } else {
                        self.items[i].addClassName('highlighted');
	                }
                } else {
                    self.items[i].removeClassName('highlighted');
                }
            }
        },
        hasOverlap : function(a, b){
            var x = a.getBoundingClientRect();
            var y = b.getBoundingClientRect();
            return !(x.right < y.left || x.left > y.right || x.bottom < y.top || x.top > y.bottom);
        },
        filter : function(){


        },
        deselect : function(){
	        //self.selectedGroup = null;
           /* for(var i=0; i<this.items.length;i++){
                var c = this.items[i];
                c.removeClassName('selected');
	            this.select.options[i].selected = false;
            }*/
	        var els = self.ul.getElementsByClassName('selected');
	        for(i=0; i<els.length; i++) els[i].removeClassName('selected');
        },
		$ : function(el){
			return typeof el == 'string'? document.getElementById(el): el;
		}
    }
    self.initialize.apply(self,arguments);
    return self;
}
if(!Element.prototype.addClassName){
	Element.prototype.hasClassName = function(has){
		var pieces = this.className.split(' ');
		for(var i=0; i<pieces.length; i++)
			if(pieces[i]==has) return true;
		return false;
	}
	Element.prototype.addClassName = function(newClass){
		if(!this.hasClassName(newClass))
			this.className = (this.className += " "+newClass).trim();
	} 
	Element.prototype.removeClassName = function(remove){
		var classes = this.className.split(' ');
		var newClasses = [];
		for(var i=0; i<classes.length; i++){
			if(classes[i] != remove) newClasses.push(classes[i]);
		}
		this.className = newClasses.join(' ');
	}	
	Element.prototype.toggleClassName = function(name){
		this.hasClassName(name)?this.removeClassName(name):this.addClassName(name);
	}
}

