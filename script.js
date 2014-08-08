// Library Demo Program
// JavaScript Portion
// Frank Grams, July 2014
// http://jsfiddle.net/fgrams/dTKqg/

// Remarks:
//
// My initial solution just used the structure provided by the HTML
// DOM, without attempting to use a parallel data structure.  The data
// structure does actually get used as the driver for the Book List function.
// For everything else, the DOM is the driver, and the data structure is
// maintained in parallel.  I could have implemented it with better data
// structures than JavaScript's poor pseudo-array/hashtable
// construction. If you want me to use a real data structure that provides
// non-naive search functionality, let me know and I'll add it for you. As it
// is, the computational complexity of the program is unfavorable, around
// O(n) worst-case I think, given the use of naive search for various
// operations.
//
// Both the enshelf and unshelf functions would
// have made more sense being implemented at the Library level
// because of the need to work with event handlers and because
// the event handlers get the HTML DOM elements as inputs, not the
// custom data structure items.  This makes it more natural to have a single
// point of entry into the data structure: the library object.  I was able
// to implement it according to the assignment instructions, though.

//Class Definitions

function Library(){
    this.$domElement = $('#shelfCollection');
    this.shelfCollection = [];
    this.listBooks = function(){
        var i, s = '';
        for (i = 0; i < this.shelfCollection.length; ++i) {
            s += this.shelfCollection[i].listBooks();
        }
        
        return s;
    };
    this.addShelf = function(s, handler){
        //Make the shelf, apply an event handler, store it in the data
        //structure, and put it in the HTML DOM.  Also, maintain a sub
        //unordered-list level for the books under the shelf name list
        //item.
        var $newShelf = $('<li class="shelfName">' + s + '</li>');
        $newShelf.click(handler);
        this.shelfCollection.push(
            new Shelf($newShelf));
        this.$domElement.append($newShelf);
        this.$domElement.append('<ul class="shelf"></ul>');
    };
    this.removeShelf = function($domElement){
        //Remove the shelf from the data structure and the DOM, and the
        //sub-list of books from the DOM.
        var i;
        for (i = 0; i < this.shelfCollection.length; ++i) {
            if (this.shelfCollection[i].$domElement.is($domElement)) {
                this.shelfCollection.splice(i, 1);
                break;
            }
        }
        $domElement.next().remove();
        $domElement.remove();
    };
}

function Shelf($domElement){
    this.$domElement = $domElement;
    this.bookCollection = [];
    this.listBooks = function(){
        var i, s = '';
        for (i = 0; i < this.bookCollection.length; ++i) {
            s += this.bookCollection[i].$domElement.text() + '\n';
        }
        return s;
    };
}

function Book($domElement){
    this.$domElement = $domElement;
    this.enshelf = function(olibrary, $shelf, handler){
        //Find the current shelf in the data structure, attach the book
        //to the data structure, attach it to the HTML DOM, and apply an
        //event handler.
        var i, oshelfCollection;
        oshelfCollection = olibrary.shelfCollection;
        for (i = 0; i < oshelfCollection.length; ++i) {
            if (oshelfCollection[i].$domElement.is($shelf)) {
                    oshelfCollection[i].bookCollection.push(this);
                $shelf.next().append(this.$domElement);
                this.$domElement.click(handler);
                break;
            }
        }
    };
    this.unshelf = function(olibrary, $shelf){
        //Find the current book and shelf in the data structure, remove
        //the book from the data structure, and remove the book from the
        //HTML DOM.  As it happens, the original "book" object does not
        //need to be used for this.
        var i, j, oshelfCollection;
        oshelfCollection = olibrary.shelfCollection;
        for (i = 0; i < oshelfCollection.length; ++i) {
            if (oshelfCollection[i].$domElement.is($shelf)) {
                for (j = 0; j < oshelfCollection[i].bookCollection.length;
                        ++j) {
                    if (oshelfCollection[i].bookCollection[j].
                        $domElement.is(this.$domElement)) {
                        this.$domElement.remove();
                        oshelfCollection[i].bookCollection.splice(j, 1);
                        break;
                    }
                }
                break;
            }
        }
    };
}

//JQuery UI Interactions
$(document).ready(function(){
    //Set initial state
    var ballowEdit = true, $currentShelf = null, $currentBook = null,
        $textInput = $('#textInput');
        olibrary = new Library();
    
    $('#shelfViewButton').addClass('selected');
    
    //Event Handlers
    
    $('#addShelfButton').click(function(){
        var s = $textInput.val();
        if (ballowEdit && '' != s) {
            olibrary.addShelf(s, listItemHandler);
            $textInput.val('');
        }
    });
    
    $('#removeShelfButton').click(function(){
        if (ballowEdit && null != $currentShelf) {
            olibrary.removeShelf($currentShelf);
            $currentShelf = null;
            $currentBook = null;
        }
    });
    
    $('#enshelfButton').click(function(){
        var s = $textInput.val(), obook;
        if (ballowEdit && '' != s && null != $currentShelf) {
            obook = new Book($('<li class="book">' + s + '</li>'));
            obook.enshelf(olibrary, $currentShelf, listItemHandler);
            $textInput.val('');
        }
    });
    
    $('#unshelfButton').click(function(){
        var obook;
        if (ballowEdit && null != $currentShelf && null != $currentBook) {
            //Cheating here by just making new Book object instead of
            //searching for the original in the data structure.  It works
            //out the same.
            obook = new Book($currentBook);
            obook.unshelf(olibrary, $currentShelf);
            $currentBook = null;
        }
    });
        
    $('#helpButton').click(function(){
        //Show the Help view.
        $('#bookList').hide();
        $('#helpText').show();
        $('#shelfCollection').hide();
        
        //Change the button colors.
        $('#helpButton').addClass('selected');
        $('#shelfViewButton').removeClass('selected');
        $('#bookListButton').removeClass('selected');
        
        ballowEdit=false;
    });
    
    $('#shelfViewButton').click(function(){
        //Show the Shelf View view.
        $('#bookList').hide();
        $('#helpText').hide();
        $('#shelfCollection').show();
        
        //Change the button colors.
        $('#helpButton').removeClass('selected');
        $('#shelfViewButton').addClass('selected');
        $('#bookListButton').removeClass('selected');
        
        ballowEdit=true;
    });
    
    $('#bookListButton').click(function(){
        //Show the book list view.
        $('#bookList').show();
        $('#helpText').hide();
        $('#shelfCollection').hide();
        
        $('#bookList').text(olibrary.listBooks());
        
        //Change the button colors.
        $('#helpButton').removeClass('selected');
        $('#shelfViewButton').removeClass('selected');
        $('#bookListButton').addClass('selected');
        
        ballowEdit=false;
    });
    
    $('li').click(listItemHandler);
    
    //Dynamic item event handler:
    function listItemHandler(){
        if ($(this).hasClass('shelfName')){
            if ($(this).hasClass('selected')){
                $currentShelf = null;
                $(this).removeClass('selected');
                $(this).next().hide();
            } else {
                if (null != $currentShelf){
                    $currentShelf.next().hide();
                    $currentShelf.removeClass('selected');
                }
                $(this).addClass('selected');
                $(this).next().show();
                $currentShelf = $(this);
            }
            
            if (null != $currentBook){
                $currentBook.removeClass('selected');
            }
            $currentBook = null;
        } else if ($(this).hasClass('book')){
            if ($(this).hasClass('selected')){
                $currentBook = null;
                $(this).removeClass('selected');
            } else {
                if (null != $currentBook){
                    $currentBook.removeClass('selected');
                }
                $(this).addClass('selected');
                $currentBook = $(this);
            }
        }
    }
});