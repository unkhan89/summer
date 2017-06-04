import cv2
import numpy
import time
import traceback
import thread
import logging as log
import vision_lib
import flask


################################ OpenCV speicifics:

global WINDOW_NAME
WINDOW_NAME = 'Checkers Player | OpenCV Controller'

WAIT_KEY_MS = 500

COLOR_YELLOW_PIECES = {
'lower_bound' : numpy.array([9, 124, 129]),
'upper_bound' : numpy.array([44, 209, 255]),
'erosion' : 2,
'dilation' : 17
}

COLOR_RED_PIECES = {
'lower_bound' : numpy.array([155, 118, 96]),
'upper_bound' : numpy.array([193, 219, 184]),
'erosion' : 0,
'dilation' : 12
}

COLOR_GREEN_LINES = {
'lower_bound' : numpy.array([28, 41, 87]),
'upper_bound' : numpy.array([64, 158, 176]),
'erosion' : 2,
'dilation' : 3
}

COLOR_GREEN = {
  'bgr' : [0, 255, 0]
}

COLOR_YELLOW = {
  'bgr' : [0, 255, 255]
}

COLOR_RED = {
  'bgr' : [0, 0, 255]
}

IMAGE_WIDTH = 640

IMAGE_HEIGHT = 480



def get_image():

  # _, image = cap.read()   # if capturing a single frame from a camera
  image = cv2.imread('./sample_images/raw1.jpg')   # if reading an image from disk

  return image


'''
    Given an image and a color object, returns an image the color whited and everything else filtered out.
'''
hsv_image = None    # optimization, no need to convert to hsv repeatedly

def filter(image, color_obj):

  # now = time.time()

  log.debug('Filtering color: ' + str(color_obj));

  global windowName

  # cv2.imshow(WINDOW_NAME, image)
  # cv2.waitKey(WAIT_KEY_MS)

  if hsv_image is None: 

    log.debug('Converting to HSV')

    image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
  
  else: 

    image = hsv_image
  # cv2.imshow(WINDOW_NAME, image)
  # cv2.waitKey(WAIT_KEY_MS)

  log.debug('Filtering color, from ' + str(color_obj['lower_bound']) + ' to ' + str(color_obj['upper_bound']))

  image = cv2.inRange(image, color_obj['lower_bound'], color_obj['upper_bound'])

  # cv2.imshow(WINDOW_NAME, image)
  # cv2.waitKey(WAIT_KEY_MS)

  if color_obj['erosion'] != 0:

    log.debug('Eroding ' + str(color_obj['erosion']))

    erosion_kernel = numpy.ones((color_obj['erosion'], color_obj['erosion']), numpy.uint8)

    image = cv2.erode(image, erosion_kernel)

    # cv2.imshow(WINDOW_NAME, image)
    # cv2.waitKey(WAIT_KEY_MS)

  log.debug('Dilating ' + str(color_obj['dilation']))

  dilation_kernel = numpy.ones((color_obj['dilation'], color_obj['dilation']), numpy.uint8)

  image = cv2.dilate(image, dilation_kernel)

  # cv2.imshow(WINDOW_NAME, image)
  # cv2.waitKey(WAIT_KEY_MS)

  # log.warn('filter() took ' + str(time.time() - now) + ' seconds')

  return image


'''
    Given a black and white image, returns a new image with the white cells colored in.
'''
def color_in(ref_image, ret_image, colorBGR):

  color_cell = numpy.array(colorBGR, dtype='uint8') 

  # construct a new image to color onto if need be

  if ret_image is None: 

    new_image_cell = numpy.array([0, 0, 0], dtype='uint8')
    new_image_row = numpy.array( [ new_image_cell ] * IMAGE_WIDTH , dtype='uint8')
    ret_image = numpy.array( [new_image_row] * IMAGE_HEIGHT,  dtype='uint8')

  # replace white pixels with a colored one in a new image/matrix:

  for i, row in enumerate(ref_image):

    for j, cell in enumerate(row):

      if cell == 255:   # white cell

        ret_image[i][j] = color_cell

  return ret_image



def process_image(original_image):

  now = time.time()

  image_red_pieces = filter(original_image.copy(), COLOR_RED_PIECES)
  image_red_pieces = color_in(image_red_pieces, None, COLOR_RED['bgr'])

  log.warn('process_image() up to filtering red pieces took ' + str(time.time() - now) + ' seconds')

  image_yellow_pieces = filter(original_image.copy(), COLOR_YELLOW_PIECES)
  image_yellow_pieces = color_in(image_yellow_pieces, image_red_pieces, COLOR_YELLOW['bgr'])

  log.warn('process_image() up to filtering yellow pieces took ' + str(time.time() - now) + ' seconds')

  image_green_lines = filter(original_image.copy(), COLOR_GREEN_LINES)
  image_green_lines = color_in(image_green_lines, image_yellow_pieces, COLOR_GREEN['bgr'])

  log.warn('process_image() up to filtering green lines took ' + str(time.time() - now) + ' seconds')

  log.info('DONE modifying image')

  return image_green_lines


def update_gui(image):
  
  global WINDOW_NAME  
  
  cv2.namedWindow(WINDOW_NAME, 0)    # 0 flag for allowing resize

  cv2.resizeWindow(WINDOW_NAME, IMAGE_WIDTH, IMAGE_HEIGHT)

  cv2.imshow(WINDOW_NAME, image)

  cv2.waitKey(WAIT_KEY_MS * 10)

  # cv2.destroyAllWindows()



################################ Web sever specifics:

server = flask.Flask('Web Controller', static_folder='templates')

server.debug = True

server_port = 5000


@server.route('/')
def hello():
  
  return 'Hello World'


@server.route('/calibrate')
def get_calibrate_page():

  # return send_from_directory(server.static_folder, 'calibrate.html')

  return render_template(
    'calibrate.html', 
    yellowPiecesErosion = COLOR_YELLOW_PIECES['erosion'], 
    yellowPiecesDilation = COLOR_YELLOW_PIECES['dilation'], 
    yellowPiecesLowerBlue = COLOR_YELLOW_PIECES['lower_bound'][0], 
    yellowPiecesUpperBlue = COLOR_YELLOW_PIECES['upper_bound'][0],
    yellowPiecesLowerGreen = COLOR_YELLOW_PIECES['lower_bound'][1], 
    yellowPiecesUpperGreen = COLOR_YELLOW_PIECES['upper_bound'][1],
    yellowPiecesLowerRed = COLOR_YELLOW_PIECES['lower_bound'][2], 
    yellowPiecesUpperRed = COLOR_YELLOW_PIECES['upper_bound'][2],
    redPiecesErosion = COLOR_RED_PIECES['erosion'], 
    redPiecesDilation = COLOR_RED_PIECES['dilation'], 
    redPiecesLowerBlue = COLOR_RED_PIECES['lower_bound'][0], 
    redPiecesUpperBlue = COLOR_RED_PIECES['upper_bound'][0],
    redPiecesLowerGreen = COLOR_RED_PIECES['lower_bound'][1], 
    redPiecesUpperGreen = COLOR_RED_PIECES['upper_bound'][1],
    redPiecesLowerRed = COLOR_RED_PIECES['lower_bound'][2], 
    redPiecesUpperRed = COLOR_RED_PIECES['upper_bound'][2],
    greenLinesErosion = COLOR_GREEN_LINES['erosion'], 
    greenLinesDilation = COLOR_GREEN_LINES['dilation'], 
    greenLinesLowerBlue = COLOR_GREEN_LINES['lower_bound'][0], 
    greenLinesUpperBlue = COLOR_GREEN_LINES['upper_bound'][0],
    greenLinesLowerGreen = COLOR_GREEN_LINES['lower_bound'][1], 
    greenLinesUpperGreen = COLOR_GREEN_LINES['upper_bound'][1],
    greenLinesLowerRed = COLOR_GREEN_LINES['lower_bound'][2], 
    greenLinesUpperRed = COLOR_GREEN_LINES['upper_bound'][2]
  )


@server.route('/setBounds')
def set_bounds():

  checkers_object = request.args.get('object')

  blue_lower = int(request.args.get('lower1'))
  blue_upper = int(request.args.get('upper1'))

  green_lower = int(request.args.get('lower2'))
  green_upper = int(request.args.get('upper2'))

  red_lower = int(request.args.get('lower3'))
  red_upper = int(request.args.get('upper3'))

  if checkers_object == 'yellowPieces':

    COLOR_YELLOW_PIECES['lower_bound'] = numpy.array([blue_lower, green_lower, red_lower])
    COLOR_YELLOW_PIECES['upper_bound'] = numpy.array([blue_upper, green_upper, red_upper])

  elif checkers_object == 'redPieces':

    COLOR_RED_PIECES['lower_bound'] = numpy.array([blue_lower, green_lower, red_lower])
    COLOR_RED_PIECES['upper_bound'] = numpy.array([blue_upper, green_upper, red_upper])

  elif checkers_object == 'greenLines':

    COLOR_GREEN_LINES['lower_bound'] = numpy.array([blue_lower, green_lower, red_lower])
    COLOR_GREEN_LINES['upper_bound'] = numpy.array([blue_upper, green_upper, red_upper])

  else:

    log.warn('Unknown object to modify: ' + request.args.get('object'))

    return 'Unknown object to modify: ' + request.args.get('object'), 400

  update_gui(process_image(get_image()))

  return 'OK'
  


@server.route('/setDilation')
def set_dilation():
  
  checkers_object = request.args.get('object')

  dilation = int(request.args.get('dilation'))

  if checkers_object == 'yellowPieces':

    COLOR_YELLOW_PIECES['dilation'] = dilation

  elif checkers_object == 'redPieces':

    COLOR_RED_PIECES['dilation'] = dilation

  elif checkers_object == 'greenLines':

    COLOR_GREEN_LINES['dilation'] = dilation

  else:

    log.warn('Unknown object to modify: ' + request.args.get('object'))

    return 'Unknown object to modify: ' + request.args.get('object'), 400

  update_gui(process_image(get_image()))

  return 'OK'

  

@server.route('/setErosion')
def set_erosion():
    
  checkers_object = request.args.get('object')

  erosion = int(request.args.get('erosion'))

  if checkers_object == 'yellowPieces':

    COLOR_YELLOW_PIECES['erosion'] = erosion

  elif checkers_object == 'redPieces':

    COLOR_RED_PIECES['erosion'] = erosion

  elif checkers_object == 'greenLines':

    COLOR_GREEN_LINES['erosion'] = erosion

  else:

    log.warn('Unknown object to modify: ' + request.args.get('object'))

    return 'Unknown object to modify: ' + request.args.get('object'), 400

  update_gui(process_image(get_image()))

  return 'OK'


@server.route('/getPositions')
def get_positions():

  positions = vision_lib.determine_cell_contents(process_image(get_image()))

  log.info('Current setup: ' + str(positions))

  return flask.jsonify(positions)


if __name__ == '__main__':

  log.basicConfig(level=log.INFO, format='%(asctime)s | %(levelname)s | %(module)s:%(lineno)s | %(message)s')

  log.info('Hello') 

  # image = get_image()

  # image = process_image(image)
  
  # positions = vision_lib.determine_cell_contents(image)

  # log.info('Current setup: ' + str(positions))

  # update_gui(image)

  server.run(port=server_port, use_reloader=False)

  log.info('Server ready and listening on port ' + str(server_port))
