/* bender-tags: editor,widget */
/* bender-ckeditor-plugins: easyimage,toolbar,contextmenu,undo */
/* bender-include: _helpers/tools.js */
/* globals easyImageTools */

( function() {
	'use strict';

	bender.editors = {
		classic: {},

		divarea: {
			config: {
				extraPlugins: 'divarea'
			}
		},

		inline: {
			creator: 'inline'
		}
	};

	var originalGetClientRect = CKEDITOR.dom.element.prototype.getClientRect,
		widgetHtml = '<figure class="image easyimage"><img src="../image2/_assets/foo.png" alt="foo"><figcaption>Test image</figcaption></figure>',
		sideWidgetHtml = '<figure class="image easyimage easyimage-side"><img src="../image2/_assets/foo.png" alt="foo"><figcaption>Test image</figcaption></figure>',
		tests = {
			setUp: function() {
				if ( CKEDITOR.env.ie ) {
					CKEDITOR.dom.element.prototype.getClientRect = function() {
						return {
							width: 0,
							height: 0,
							left: 0,
							top: 0
						};
					};
				}
			},

			tearDown: function() {
				var currentDialog = CKEDITOR.dialog.getCurrent();

				if ( currentDialog ) {
					currentDialog.hide();
				}

				if ( CKEDITOR.env.ie ) {
					CKEDITOR.dom.element.prototype.getClientRect = originalGetClientRect;
				}
			},

			'test commands are enabled only on widget': function( editor, bot ) {
				bot.setData( widgetHtml, function() {
					var widget = editor.widgets.getByElement( editor.editable().findOne( 'figure' ) );

					easyImageTools.assertCommandsState( editor, {
						easyimageFull: CKEDITOR.TRISTATE_DISABLED,
						easyimageSide: CKEDITOR.TRISTATE_DISABLED,
						easyimageAlt: CKEDITOR.TRISTATE_DISABLED
					} );

					widget.focus();

					easyImageTools.assertCommandsState( editor, {
						easyimageFull: CKEDITOR.TRISTATE_ON,
						easyimageSide: CKEDITOR.TRISTATE_OFF,
						easyimageAlt: CKEDITOR.TRISTATE_OFF
					} );
				} );
			},

			'test easyimageAlt command': function( editor, bot ) {
				bot.setData( widgetHtml, function() {
					var widget = editor.widgets.getByElement( editor.editable().findOne( 'figure' ) );

					editor.once( 'dialogShow', function( evt ) {
						resume( function() {
							var dialog = evt.data;

							assert.areSame( 'foo', dialog.getValueOf( 'info', 'txtAlt' ),
								'Initial value is fetched from image' );

							dialog.setValueOf( 'info', 'txtAlt', 'bar' );
							dialog.getButton( 'ok' ).click();

							assert.areSame( 'bar', editor.editable().findOne( 'img' ).getAttribute( 'alt' ),
								'Alt text of image is changed' );
						} );
					} );

					widget.focus();
					editor.execCommand( 'easyimageAlt' );
					wait();
				} );
			},

			'test easyimageFull and easyimageSide commands': function( editor, bot ) {
				bot.setData( widgetHtml, function() {
					var widget = editor.widgets.getByElement( editor.editable().findOne( 'figure' ) );

					widget.focus();

					assert.isFalse( widget.element.hasClass( 'easyimage-side' ), 'Image does not have side class' );
					assert.isTrue( widget.hasClass( 'easyimage' ), 'Widget wrapper has main class' );
					assert.isFalse( widget.hasClass( 'easyimage-side' ),
						'Widget wrapper does not have side class' );
					assert.areSame( 'full', widget.data.type, 'Widget has correct type data' );

					bot.contextmenu( function( menu ) {
						easyImageTools.assertMenuItemsState( menu.items, {
							easyimageFull: CKEDITOR.TRISTATE_ON,
							easyimageSide: CKEDITOR.TRISTATE_OFF
						} );

						editor.execCommand( 'easyimageSide' );

						assert.isTrue( widget.element.hasClass( 'easyimage-side' ), 'Image has side class' );
						assert.isTrue( widget.hasClass( 'easyimage' ), 'Widget wrapper has main class' );
						assert.isTrue( widget.hasClass( 'easyimage-side' ), 'Widget wrapper has side class' );
						assert.areSame( 'side', widget.data.type, 'Widget has correct type data' );

						bot.contextmenu( function( menu ) {
							easyImageTools.assertMenuItemsState( menu.items, {
								easyimageFull: CKEDITOR.TRISTATE_OFF,
								easyimageSide: CKEDITOR.TRISTATE_ON
							} );

							menu.hide();
						} );
					} );
				} );
			},

			'test initial type data for side image': function( editor, bot ) {
				bot.setData( sideWidgetHtml, function() {
					var widget = editor.widgets.getByElement( editor.editable().findOne( 'figure' ) );

					assert.areSame( 'side', widget.data.type, 'Widget has correct type data' );
				} );
			},

			'test balloontoolbar integration': function( editor, bot ) {
				bot.setData( widgetHtml, function() {
					var widget = editor.widgets.getByElement( editor.editable().findOne( 'figure' ) ),
						toolbar = editor.balloonToolbars._contexts[ 0 ].toolbar;

					toolbar._view.once( 'show', function() {

					easyImageTools.assertCommandsState( editor, {
							easyimageFull: CKEDITOR.TRISTATE_ON,
							easyimageSide: CKEDITOR.TRISTATE_OFF,
							easyimageAlt: CKEDITOR.TRISTATE_OFF
						} );

						editor.once( 'afterCommandExec', function() {
							resume( function() {
								easyImageTools.assertCommandsState( editor, {
									easyimageFull: CKEDITOR.TRISTATE_OFF,
									easyimageSide: CKEDITOR.TRISTATE_ON,
									easyimageAlt: CKEDITOR.TRISTATE_OFF
								} );
							} );
						} );

						editor.execCommand( 'easyimageSide' );
					} );

					widget.focus();
					wait();
				} );
			}
		};

	tests = easyImageTools.createTestsForEditors( CKEDITOR.tools.objectKeys( bender.editors ), tests );
	bender.test( tests );
} )();
