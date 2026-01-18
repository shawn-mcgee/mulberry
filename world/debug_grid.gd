@tool
extends Node2D

var _texture: Texture2D
var _width  : int = 32
var _depth  : int = 32

@export var texture: Texture2D:
  get = _get_texture,
  set = _set_texture

@export var width: int:
  get = _get_width,
  set = _set_width

@export var depth: int:
  get = _get_depth,
  set = _set_depth

func _get_texture() -> Texture2D:
  return _texture

func _get_width() -> int:
  return _width

func _get_depth() -> int:
  return _depth

func _set_texture(value: Texture2D):
  _texture = value
  queue_redraw()

func _set_width(value: int):
  _width = value
  queue_redraw()

func _set_depth(value: int):
  _depth = value
  queue_redraw()

func _draw() -> void:
  if not _texture:
    return

  for i in range(_width):
    for j in range(_depth):
      var pixel = Isometric.world_to_pixel(Vector2(i, j))

      var dst_rect = Rect2(
        pixel.x - Isometric.TILE_HALF_WIDTH,
        pixel.y                            ,
        Isometric.TILE_WIDTH,
        Isometric.TILE_DEPTH
      )

      var src_rect;
      if (i + j) & 1:
        src_rect = Rect2(0                   , 0, Isometric.TILE_WIDTH, Isometric.TILE_DEPTH)
      else:
        src_rect = Rect2(Isometric.TILE_WIDTH, 0, Isometric.TILE_WIDTH, Isometric.TILE_DEPTH)
      
      draw_texture_rect_region(_texture, dst_rect, src_rect)