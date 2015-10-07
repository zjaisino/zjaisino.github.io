/**
 * High-level editor interface that communicates with underlying editor (like 
 * TinyMCE, CKEditor, etc.) or browser.
 * Basically, you should call <code>zen_editor.setContext(obj)</code> method to
 * set up undelying editor context before using any other method.
 * 
 * This interface is used by <i>zen_actions.js</i> for performing different 
 * actions like <b>Expand abbreviation</b>  
 * 
 * @example
 * var textarea = document.getElemenetsByTagName('textarea')[0];
 * zen_editor.setContext(textarea);
 * //now you are ready to use editor object
 * zen_editor.getSelectionRange();
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * @modification GreLI (grelimail@gmail.com)
 */
var zen_editor = (function(){
	var dom = null,
	    // Set default indentation to one tab as per Zen Coding default
	    indent_size = 1,
	    indentation_use_tabs = 'TRUE',
	    // Check for style attribute
	    re_style_attr_begin = /\bstyle\s*=\s*("[^"]*|'[^']*)$/,
		app_language = dw.getAppLanguage();

	if (app_language) {
		zen_coding.setVariable('lang', app_language.substring(0,2));
		zen_coding.setVariable('locale', app_language);
	}

	/**
	 * Returns whitrespace padding of string
	 * @param {String} str String line
	 * @return {String}
	 */
	function getStringPadding(str) {
		return (str.match(/^(\s+)/) || [''])[0];
	}

	/**
	 * Find start and end index of text line for <code>from</code> index
	 * @param {String} text 
	 * @param {Number} from 
	 */
	function getLineBounds(text, from) {
		var ch = '',
			end = from,
			text_length = text.length;

		// Find start of line
		while (from && (ch = text.charAt(from - 1)) !== '\n' && ch !== '\r')
			from--;

		// Find end of line
		while (end < text_length && (ch = text.charAt(end)) !== '\n' && ch !== '\r')
			end++;

		return {start: from, end: end};
	}

	return {
		/**
		 * Setup underlying editor context. You should call this method 
		 * <code>before</code> using any Zen Coding action.
		 * @param {Object} context
		 */
		setContext: function() {
			dom = dw.getDocumentDOM(); // Get current document DOM.

			// Check new line settings.
			var newLine = dw.getPreferenceInt('Source Format', 'Line Break Type', 0x0A);
			zen_coding.setNewline( (newLine === 0x0D0A) ? '\x0D\x0A' : String.fromCharCode(newLine) );

			// Check identation settings. Defaults set to Dreamweaver values.
			var sf_indent_size = dw.getPreferenceInt('Source Format', 'Indent Size', 2),
				sf_use_tabs = dw.getPreferenceString('Source Format', 'Use Tabs', 'FALSE'),
				indentation = '';

			// Apply settings if they are different
			if (this.indent_size !== sf_indent_size && this.indentation_use_tabs !== sf_use_tabs) {
				this.indent_size = sf_indent_size;
				this.indentation_use_tabs = sf_use_tabs;

				indentation = zen_coding.repeatString(sf_use_tabs.toUpperCase() === 'TRUE' ? '\t' : ' ', sf_indent_size);

				zen_coding.setVariable('indentation', indentation);
			}
		},

		/**
		 * Returns character indexes of selected text: object with <code>start</code>
		 * and <code>end</code> properties. If there's no selection, should return 
		 * object with <code>start</code> and <code>end</code> properties referring
		 * to current caret position
		 * @return {Object}
		 * @example
		 * var selection = zen_editor.getSelectionRange();
		 * alert(selection.start + ', ' + selection.end); 
		 */
		getSelectionRange: function() {
			var selection = dom.source.getSelection();
			return {
				start: selection[0],
				end: selection[1]
			};
		},

		/**
		 * Creates selection from <code>start</code> to <code>end</code> character
		 * indexes. If <code>end</code> is ommited, this method should place caret 
		 * and <code>start</code> index
		 * @param {Number} start
		 * @param {Number} [end]
		 * @example
		 * zen_editor.createSelection(10, 40);
		 * 
		 * //move caret to 15th character
		 * zen_editor.createSelection(15);
		 */
		createSelection: function(start, end) {
			return dom.source.setSelection(start, end);
		},

		/**
		 * Returns current line's start and end indexes as object with <code>start</code>
		 * and <code>end</code> properties
		 * @return {Object}
		 * @example
		 * var range = zen_editor.getCurrentLineRange();
		 * alert(range.start + ', ' + range.end);
		 */
		getCurrentLineRange: function() {
			var content = this.getContent(),
				caret_pos = this.getCaretPos();

			return getLineBounds(content, caret_pos);
		},

		/**
		 * Returns current caret position
		 * @return {Number|null}
		 */
		getCaretPos: function(){
			return dom.source.getSelection()[1];
		},

		/**
		 * Set new caret position
		 * @param {Number} pos Caret position
		 */
		setCaretPos: function(pos){
			return dom.source.setSelection(pos, pos);
		},

		/**
		 * Returns content of current line
		 * @return {String}
		 */
		getCurrentLine: function() {
			var content = this.getContent(),
			    caret_pos = this.getCaretPos(),
				line = getLineBounds(content, caret_pos);

			return content.substring(line.start, line.end);
		},

		/**
		 * Replace editor's content or it's part (from <code>start</code> to 
		 * <code>end</code> index). If <code>value</code> contains 
		 * <code>caret_placeholder</code>, the editor will put caret into 
		 * this position. If you skip <code>start</code> and <code>end</code>
		 * arguments, the whole target's content will be replaced with 
		 * <code>value</code>. 
		 * 
		 * If you pass <code>start</code> argument only,
		 * the <code>value</code> will be placed at <code>start</code> string 
		 * index of current content. 
		 * 
		 * If you pass <code>start</code> and <code>end</code> arguments,
		 * the corresponding substring of current target's content will be 
		 * replaced with <code>value</code>. 
		 * @param {String} value Content you want to paste
		 * @param {Number} [start] Start index of editor's content
		 * @param {Number} [end] End index of editor's content
		 */
		replaceContent: function(value, start, end) {
			var caret_placeholder = zen_coding.getCaretPlaceholder(), // get '{%::zen-caret::%}', do not hardcode it!
				caret_pos = end;

			// indent new value
			value = zen_coding.padString(value, getStringPadding(this.getCurrentLine()));

			// find new caret position
			var new_pos = value.indexOf(caret_placeholder);
			if (new_pos !== -1) {
				caret_pos = start + new_pos; // adjust caret position
				value = value.split(caret_placeholder).join(''); // remove placeholders from string
			} else {
				// if there is no position placeholder set caret position to the end of the insertion
				caret_pos = start + value.length;
			}

			dom.source.replaceRange(start, end, value); // paste new content
			this.setCaretPos(caret_pos); // place caret
		},

		/**
		 * Returns editor's content
		 * @return {String}
		 */
		getContent: function(){
			return dom.source.getText();
		},

		/**
		 * Returns current editor's syntax mode
		 * @return {String}
		 */
		getSyntax: function(){
			var parse_mode = dom.getParseMode(),
				caret_pos = this.getCaretPos();

			if (dom.documentType.indexOf('XSLT') !== -1)
				parseMode = 'xsl';

			if (parse_mode === 'html') {
				var content = this.getContent(),
					pair = zen_coding.html_matcher.getTags(content, caret_pos); // get the context tag
				if (pair && pair[0] && pair[0].type === 'tag') {
					// check that we're inside style tag
					if( (pair[0].name.toLowerCase() === 'style' && pair[0].end <= caret_pos && pair[1].start >= caret_pos)
						// or inside style attribute
						|| re_style_attr_begin.test(content.substring(pair[0].start, caret_pos)) ) {
						parse_mode = 'css';
					}
					if( (pair[0].name.toLowerCase() === 'script' && pair[0].end <= caret_pos && pair[1].start >= caret_pos)
						// or inside style attribute
						|| re_style_attr_begin.test(content.substring(pair[0].start, caret_pos)) ) {
						parse_mode = 'js';
					}
				}
			}
			
			return parse_mode;
		},

		/**
		 * Returns current output profile name (@see zen_coding#setupProfile)
		 * @return {String}
		 */
		getProfileName: function() {
			switch(dom.documentType) {
				case 'XML':
				case 'XSLT':
				case 'XSLT-fragment':
					return 'xml';
				case 'HTML':
					// html or xhtml?
					return dom.source.getText().search(/<!DOCTYPE[^>]+XHTML.+?>/) !== -1 ? 'xhtml' : 'html';
				default:
					return dom.documentType;
			}
		}
	}
})();