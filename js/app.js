(function(){
	var app = angular.module('cardGame', ['blockUI']);

	/*Usage of angular-block-ui (blockUI).
	An AngularJS module that allows you to block user interaction. 
	Blocking is done automatically for each http request and/or manually via an injectable service.
	Link: https://github.com/McNull/angular-block-ui*/

	app.controller('cardController', function($scope, $http, $location, $window, $timeout, blockUI){
		var scope = $scope,
			firstCard = '',
			secondCard = '',
			firstElement = '',
			secondElement = '',
			clockTime = 0, //default countdown time in seconds
			stopped, //control over countdown timer
			timer, //control over timer showing wrong cards during a few seconds
			game = 0, //indicates the current game level
			gamesLimit = 3; //maximum number of levels
		scope.flippedCard = false;
		scope.counter = clockTime;

		/* Timeout function (1000 milliseconds = 1 second)
		Cancels a task associated with the promise. The promise will be resolved with a rejection. */ 
		scope.countdown = function() {
		    stopped = $timeout(function() {
		     	scope.counter--;
		    	scope.countdown();   
			}, 1000);
		};

		//stop all clocks, cleans card variables and resets the countdown value
		scope.stopClock = function(){
   			$timeout.cancel(stopped);
   			$timeout.cancel(timer);
   			if(firstCard != '' || firstElement != ''){
				firstCard = '';
				firstElement = '';
   			}
   			if(secondCard != '' || secondElement != ''){
   				secondCard = '';		
				secondElement = '';
   			}
   			scope.counter = clockTime;
    	};

    	//watch 'counter' so we can stop it when it reaches zero (0) and also flip cards down
    	scope.$watch('counter', function() {
    		if(scope.counter <= 0){
    			flipCardsDown();
    			scope.stopClock();
    		}
    	});

    	//Turn flipped cards down removing their background, their "flippedCard" class and stopping the clock
    	var flipCardsDown = function(){
    		if(firstCard != '' || firstElement != ''){
	    		firstElement.style.backgroundImage = '';
    			firstCard.flippedCard = false;
    		}
    		if(secondCard != '' || secondElement != ''){
		    	secondElement.style.backgroundImage = '';
	    		secondCard.flippedCard = false;
	    	}
	    	scope.stopClock();
    	};

		scope.flipCard = function(event){
			//if clicked in a flipped card, do nothing
			if(this.flippedCard) return false;

			//card flipped: CSS is active with green border and its background image
			this.flippedCard = true; 
			event.target.style.backgroundImage = 'url(' + this.data.url +')';

			//No cards are flipped, nothing to compare to, assing firstCard and start countdown
			//'this' is the object associated to the element where we can access to 'data' 
			// and 'event.target' is the selected DOM element
			if(firstCard === ''){
				firstCard = this;
				firstElement = event.target;
				scope.countdown();
			}else{
				secondCard = this;
				secondElement = event.target;

				//if equal cards selected keep count of the rest and stop the countdown clock	
				if (firstCard.data.name === secondCard.data.name) {	
					scope.cardsNumber -= 2;
					scope.stopClock();					
				}else{
					//if different cards selected, block the user interface and wait a few seconds
					//in order to show both cards
    				blockUI.start();
					timer= $timeout(function () {		
    					//flip cards down disabling any CSS applied and stopping the countdown clock
						flipCardsDown();
						// Unblock the user interface
      					blockUI.stop();
					}, 700);
				}
			}
		};

		//Checks if we have reached the maximum value for levels and prevents
		// the user to go the next level by hidding the "Next Level" button
		scope.moreLevels = function(){
			if(game < gamesLimit)
				return true;
			return false;
		}

		//Resets the page so the game starts again
		scope.resetGame = function(){
			$location.path('/');
    		$window.location.reload();
		};

				//Goes to the next level
		scope.nextLevel = function(){
			game ++;
			clockTime += 5;
			//$http.jsonp to obtain the json data from a file locally
			$http.jsonp('js/games/game'+ game +'.json?callback=JSON_CALLBACK')
				.success(function (data){
			        scope.cards = data;
			        scope.counter = clockTime;
			        scope.cardsNumber = data.length;
			    })
			    .error(function (error) {
					console.log("Request failed", error);
				});
		};

		scope.nextLevel(); //Loads the first level
	});
}());