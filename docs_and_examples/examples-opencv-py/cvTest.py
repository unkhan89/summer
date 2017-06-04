
import cv2
import numpy
import time
import traceback
import thread
import logging as log

global WINDOW_NAME
WINDOW_NAME = 'OpenCV Test'

WAIT_KEY_MS = 1000

COLOR_YELLOW_PIECES = {
  'lower_bound' : numpy.array([8, 101, 129]),
  'upper_bound' : numpy.array([30, 209, 255]),
  'erosion' : 2,
  'dilation' : 10
}

COLOR_GREEN_LINES = {
  'lower_bound' : numpy.array([28, 46, 74]),
  'upper_bound' : numpy.array([64, 156, 186]),
  'erosion' : 2,
  'dilation' : 8
}

COLOR_RED_PIECES = {
  'lower_bound' : numpy.array([155, 118, 96]),
  'upper_bound' : numpy.array([193, 219, 184]),
  'erosion' : 0,
  'dilation' : 8
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

IMAGE_HEIGHT = 480

IMAGE_WIDTH = 640


'''  
    ASCII draw the highlighted pixels in the image to a file for visualization 
'''
def draw_to_ascii(image):

  image_str = '';

  for i, row in enumerate(image):

    for j, cell in enumerate(row):

      if str(cell) == '0':

        image_str = image_str + '. '

      else:

        image_str = image_str + 'X '

    image_str = image_str + '\n'

  f = open('image_str.txt', 'w')
  
  f.write(image_str)
  
  f.close()


'''
    Given an image and a color object, returns an image the color whited and everything else filtered out.
'''
def filter(image, color_obj):

  log.info('Filtering specific color');

  global windowName

  cv2.imshow(WINDOW_NAME, image)
  cv2.waitKey(WAIT_KEY_MS)

  log.debug('Converting to HSV')

  image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

  cv2.imshow(WINDOW_NAME, image)
  cv2.waitKey(WAIT_KEY_MS)

  log.debug('Filtering color, from ' + str(color_obj['lower_bound']) + ' to ' + str(color_obj['upper_bound']))

  image = cv2.inRange(image, color_obj['lower_bound'], color_obj['upper_bound'])

  cv2.imshow(WINDOW_NAME, image)
  cv2.waitKey(WAIT_KEY_MS)

  if color_obj['erosion'] != 0:

    log.debug('Eroding ' + str(color_obj['erosion']))

    erosion_kernel = numpy.ones((color_obj['erosion'], color_obj['erosion']), numpy.uint8)

    image = cv2.erode(image, erosion_kernel)

    cv2.imshow(WINDOW_NAME, image)
    cv2.waitKey(WAIT_KEY_MS)

  log.debug('Dialating ' + str(color_obj['dilation']))

  dilation_kernel = numpy.ones((color_obj['dilation'], color_obj['dilation']), numpy.uint8)

  image = cv2.dilate(image, dilation_kernel)

  cv2.imshow(WINDOW_NAME, image)
  cv2.waitKey(WAIT_KEY_MS)

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



log.basicConfig(level=log.DEBUG, format='%(asctime)s | %(levelname)s | %(module)s:%(lineno)s | %(message)s')

log.info('Hello') 

cv2.namedWindow(WINDOW_NAME, 0)    # 0 flag for allowing resize

cv2.resizeWindow(WINDOW_NAME, IMAGE_WIDTH, IMAGE_HEIGHT)


# _, image = cap.read()   # if capturing a single frame from a camera
original_image = cv2.imread('./checkers1.jpg')   # if reading an image from disk

# image = original_image.copy()
# image_final = None

image_red_pieces = filter(original_image.copy(), COLOR_RED_PIECES)
image_red_pieces = color_in(image_red_pieces, None, COLOR_RED['bgr'])

image_yellow_pieces = filter(original_image.copy(), COLOR_YELLOW_PIECES)
image_yellow_pieces = color_in(image_yellow_pieces, image_red_pieces, COLOR_YELLOW['bgr'])

image_green_lines = filter(original_image.copy(), COLOR_GREEN_LINES)
image_green_lines = color_in(image_green_lines, image_yellow_pieces, COLOR_GREEN['bgr'])


log.info('DONE modifying image')

cv2.imshow(WINDOW_NAME, image_green_lines)

cv2.waitKey(WAIT_KEY_MS * 20000)

cv2.destroyAllWindows()

log.info('Goodbye')

