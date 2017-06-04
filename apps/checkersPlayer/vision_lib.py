import cv2
import logging as log

global SHOW_IN_WINDOW 
SHOW_IN_WINDOW = False


def determine_cell_contents(image):

  ret = {}

  IMAGE_WIDTH = 640

  IMAGE_HEIGHT = 480  

  COLOR_GREEN = (0,255,0)

  COLOR_BLUE = (255, 0, 0)

  LINE_WIDTH = 1

  LINE_FACTOR = 50

  global SHOW_IN_WINDOW

  if SHOW_IN_WINDOW == True:
    WINDOW_NAME = 'Image'
    cv2.namedWindow(WINDOW_NAME, 0)    # 0 flag for allowing resize
    cv2.resizeWindow(WINDOW_NAME, IMAGE_WIDTH, IMAGE_HEIGHT)

  # for x in range(0, IMAGE_WIDTH):

  #   if x % LINE_FACTOR == 0:
      
  #     cv2.line(image, (x, 0), (x, IMAGE_HEIGHT), COLOR_BLUE, LINE_WIDTH)

  # for y in range(0, IMAGE_HEIGHT):

  #   if y % LINE_FACTOR == 0:
      
  #     cv2.line(image, (0, y), (IMAGE_WIDTH, y), COLOR_BLUE, LINE_WIDTH)

  cells = {
    'B1' : { 
      'coordinates' : (190, 20),
      'color' : None
    },
    'D1' : { 
      'coordinates' : (298, 20),
      'color' : None
    },
    'F1' : { 
      'coordinates' : (402, 20),
      'color' : None
    },
    'H1' : { 
      'coordinates' : (505, 20),
      'color' : None
    },
    ############################
    'A2' : { 
      'coordinates' : (130, 50),
      'color' : None
    },
    'C2' : { 
      'coordinates' : (240, 50),
      'color' : None
    },
    'E2' : { 
      'coordinates' : (352, 50),
      'color' : None
    },
    'G2' : { 
      'coordinates' : (460, 50),
      'color' : None
    },
    ############################
    'B3' : { 
      'coordinates' : (175, 92),
      'color' : None
    },
    'D3' : { 
      'coordinates' : (298, 92),
      'color' : None
    },
    'F3' : { 
      'coordinates' : (410, 92),
      'color' : None
    },
    'H3' : { 
      'coordinates' : (530, 92),
      'color' : None
    },
    ############################
    'A4' : { 
      'coordinates' : (114, 135),
      'color' : None
    },
    'C4' : { 
      'coordinates' : (235, 135),
      'color' : None
    },
    'E4' : { 
      'coordinates' : (355, 135),
      'color' : None
    },
    'G4' : { 
      'coordinates' : (475, 135),
      'color' : None
    },
    ############################
    'B5' : { 
      'coordinates' : (166, 180),
      'color' : None
    },
    'D5' : { 
      'coordinates' : (295, 180),
      'color' : None
    },
    'F5' : { 
      'coordinates' : (420, 180),
      'color' : None
    },
    'H5' : { 
      'coordinates' : (550, 180),
      'color' : None
    },
    #############################
    'A6' : { 
      'coordinates' : (100, 228),
      'color' : None
    },
    'C6' : { 
      'coordinates' : (226, 228),
      'color' : None
    },
    'E6' : { 
      'coordinates' : (366, 228),
      'color' : None
    },
    'G6' : { 
      'coordinates' : (495, 228),
      'color' : None
    },
    #############################
    'B7' : { 
      'coordinates' : (150, 288),
      'color' : None
    },
    'D7' : { 
      'coordinates' : (290, 288),
      'color' : None
    },
    'F7' : { 
      'coordinates' : (432, 288),
      'color' : None
    },
    'H7' : { 
      'coordinates' : (572, 288),
      'color' : None
    },
    #############################
    'A8' : { 
      'coordinates' : (65, 355),
      'color' : None
    },
    'C8' : { 
      'coordinates' : (216, 355),
      'color' : None
    },
    'E8' : { 
      'coordinates' : (364, 355),
      'color' : None
    },
    'G8' : { 
      'coordinates' : (515, 355),
      'color' : None
    }
  }

  CIRCLE_WIDTH = 10

  RECTANGLE_THICKNESS = 1

  RECTANGLE_PADDING_DEFAULT = 12

  cell_index_in_column = 1

  for cell in sorted(cells):  # goes by alphabetical order (A2, A4, A6, A8, B1, B3, ...)

    # one way of doing it:
    # rectangle_padding = RECTANGLE_PADDING_DEFAULT + cell_index_in_column

    # another: 
    rectangle_padding = RECTANGLE_PADDING_DEFAULT
    
    if cell_index_in_column == 1:
      rectangle_padding = rectangle_padding + 1    
    
    elif cell_index_in_column == 2:
      rectangle_padding = rectangle_padding + 2
    
    elif cell_index_in_column == 3:
      rectangle_padding = rectangle_padding + 4
    
    elif cell_index_in_column == 4:
      rectangle_padding = rectangle_padding + 12

    # log.debug('Processing cell ' + str(cell) + ', cell_index_in_column: ' + str(cell_index_in_column)
    #   + ', rectangle_padding: ' + str(rectangle_padding))

    rectangle_top_left = (
      cells[cell]['coordinates'][0] - rectangle_padding,
      cells[cell]['coordinates'][1] - rectangle_padding,     
    )

    rectangle_bottom_right = (
      cells[cell]['coordinates'][0] + rectangle_padding, 
      cells[cell]['coordinates'][1] + rectangle_padding
    )

    # determine what colors are in what cells:
    
    ret[cell] = determine_color(image, str(cell), (rectangle_top_left, rectangle_bottom_right))

    log.debug('Cell ' + str(cell) + ' is ' + ret[cell])
    

    if SHOW_IN_WINDOW == True:
      
      cv2.rectangle(image, rectangle_top_left, rectangle_bottom_right, COLOR_BLUE, RECTANGLE_THICKNESS)

    cell_index_in_column = cell_index_in_column + 1

    if cell_index_in_column == 5:   # on every new column, reset index

      cell_index_in_column = 1

    # cv2.circle(image, cells[cell]['coordinates'], CIRCLE_WIDTH, COLOR_GREEN, -1)

  if SHOW_IN_WINDOW == True:

    cv2.imshow(WINDOW_NAME, image)

    cv2.waitKey(1000000)

  return ret



# Given an image and a ractangle, a tuple with coordinates of top_left and bottom_right 
# coordinates ((x,y),(x,y)), returns what color is dominant
#
def determine_color(image, cellStr, rectangle):

  # log.debug('determine_color() image: ' + str(len(image)) + 'x' + str(len(image[0])) + ', rectangle: ' +  str(rectangle))

  yellow = 0
  
  red = 0

  empty = 0

  # iterate over subimage:
  
  for y in range(rectangle[0][0], rectangle[1][0]):

    for x in range(rectangle[0][1], rectangle[1][1]):

      pixel = image[x][y]

      # log.debug('Looking at cell ' + cellStr + ', pixel at ' + str(x) + 'x' + str(y) + ' -> ' + str(pixel))

      if pixel[0] < 10 and pixel[1] > 248 and pixel[2] > 248:

        yellow = yellow + 1

      elif pixel[0] < 10 and pixel[1] < 10 and pixel[2] > 248:

        red = red + 1

      else:

        empty = empty + 1;

  highest = max(yellow, red, empty)  

  if highest == yellow:

    return 'yellow'

  elif highest == red:

    return 'red'

  else:

    return 'empty'



if __name__ == '__main__':

  log.basicConfig(level=log.WARNING, format='%(asctime)s | %(levelname)s | %(module)s:%(lineno)s | %(message)s')

  log.info('Hello')

  # To test a local image instead of parameter:
  # image = cv2.imread('./checkers1.jpg')
  image = cv2.imread('./checkers_filtered.jpg')

  determine_cell_contents(image)  

