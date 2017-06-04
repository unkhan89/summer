import cv2
import numpy as np
from matplotlib import pyplot as plt

IMAGE_WIDTH = 640

IMAGE_HEIGHT = 480

COLOR_GREEN = (0,255,0)

COLOR_BLUE = (255, 0, 0)

WINDOW_NAME = 'Image'


# cv2.namedWindow(WINDOW_NAME, 0)    # 0 flag for allowing resize

# cv2.resizeWindow(WINDOW_NAME, IMAGE_WIDTH, IMAGE_HEIGHT)


img = cv2.imread('./checkers1.jpg')

img2 = img.copy()

template = cv2.imread('red_piece2.jpg', 0)

w, h = template.shape[::-1]

methods = ['cv2.TM_CCOEFF', 'cv2.TM_CCOEFF_NORMED', 'cv2.TM_CCORR',
           'cv2.TM_CCORR_NORMED', 'cv2.TM_SQDIFF', 'cv2.TM_SQDIFF_NORMED']
 
for meth in methods:
  
  try:  
    img = img2.copy()
    
    method = eval(meth)

    # Apply template Matching
    res = cv2.matchTemplate(img, template, method)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

    # If the method is TM_SQDIFF or TM_SQDIFF_NORMED, take minimum
    if method in [cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED]:
      top_left = min_loc
    else:
      top_left = max_loc
    
    bottom_right = (top_left[0] + w, top_left[1] + h)
     
    cv2.rectangle(img,top_left, bottom_right, 255, 2)
     
    plt.subplot(121),plt.imshow(res,cmap = 'gray')
    plt.title('Matching Result'), plt.xticks([]), plt.yticks([])
    plt.subplot(122),plt.imshow(img,cmap = 'gray')
    plt.title('Detected Point'), plt.xticks([]), plt.yticks([])
    plt.suptitle(meth)
     
    plt.show()

  except:

    print('Method ' + meth + ' errored out' )
    # print(error)



# cv2.rectangle(img,(15,25),(200,150),(0,0,255),15)

# cv2.imshow(WINDOW_NAME, image)

# cv2.waitKey(1000000)
