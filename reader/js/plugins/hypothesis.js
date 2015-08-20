// Epub.js to do:
// * Put in icons for the buttons.
// 		* Open sidebar
// 		* Highlight
// 		* Comment
// * Resize reading area when sidebar opens.
// * Make sure annotations update correctly when changing pages.
// 
// Epub.js bonus:
// * Low Priority: Get search working again.
// * Bonus: Make new heatmap that shows progress through the chapter and comments. 
// 	
// Hypothes.is to do: 
// * Allow a configuration file to control the following
// 		* Kill the adder
// * Fire event when sidebar is toggled?
// * Fire event when in editing mode?
//   

EPUBJS.reader.plugins.HypothesisController = function(Book) {
	var reader = this;
	var book = reader.book;
	var element = document.getElementById("hypothesis");
	var body = window.document.body;
	var annotator;
	var $main = $("#main");
	
	var updateAnnotations = function() {
		var annotatations = [],
				guestAnnotator = reader.book.renderer.render.window.annotator,
				_$, 
				$annotations, width;
		
		if(!guestAnnotator) {
			if(annotator) annotator.updateViewer([]);
			return;	
		};
		
		_$ = guestAnnotator.constructor.$;
		
		$annotations = _$(".annotator-hl");
		width = reader.book.renderer.render.iframe.clientWidth;
		
		//-- Find visible annotations
		$annotations.each(function(){
			var $this = _$(this),
					left = this.getBoundingClientRect().left;
					
			if(left >= 0 && left <= width) {
				annotatations.push($this.data('annotation'));
			}
		});
		
		//-- Update viewer
		window.annotator.updateAnnotations(annotatations);
	};
	
	var attach = function(){
		window.annotator.frame.appendTo(element);

		window.addEventListener('hypothesisSidebarOpen', function () {
			showAnnotations(true);
		});
		
		window.addEventListener('hypothesisSidebarClosed', function () {
			showAnnotations(false);
		});

		window.annotator.subscribe("annotationsLoaded", function(e){
			var _$ = reader.book.renderer.render.window.annotator.constructor.$; 
			
			
			// reader.annotator = annotator;
			updateAnnotations();
			
			_$(reader.book.renderer.contents).on("click", ".annotator-hl", function(event){
				var $this = _$(this);
				
				window.annotator.updateAnnotation([$this.data('annotation')]);
				
			});
		});
		
		reader.book.on("renderer:locationChanged", function(){
			updateAnnotations();
		});

	}
	
	var showAnnotations = function(single) {
		var currentPosition = reader.currentLocationCfi;
		reader.settings.sidebarReflow = false;

		if(single) {
			$main.addClass("single");
		} else {
			$main.removeClass("single");
		}
		
		$main.on("transitionend", function(){
			book.gotoCfi(currentPosition);
		});
		
	};
	
	book.ready.all.then(function() {
		reader.HypothesisController.attach();
	});

	return {
        'attach': attach
	};
};