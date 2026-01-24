@tool
class_name Isometric
extends Node2D

const VOLUME_WIDTH : int = 64
const VOLUME_DEPTH : int = 32
const VOLUME_HEIGHT: int = 48

@warning_ignore("integer_division")
const VOLUME_HALF_WIDTH : int = VOLUME_WIDTH  / 2
@warning_ignore("integer_division")
const VOLUME_HALF_DEPTH : int = VOLUME_DEPTH  / 2
@warning_ignore("integer_division")
const VOLUME_HALF_HEIGHT: int = VOLUME_HEIGHT / 2

var _world_position: Vector2 = Vector2.ZERO
var _pixel_position: Vector2 = Vector2.ZERO

@export var world_position: Vector2:
  get = _get_world_position,
  set = _set_world_position

@export var pixel_position: Vector2:
  get = _get_pixel_position,
  set = _set_pixel_position

func _ready() -> void:
  _update_position()

func _get_world_position() -> Vector2:
  return _world_position

func _get_pixel_position() -> Vector2:
  return _pixel_position

func _set_world_position(where: Vector2):
  _world_position =                          where
  _pixel_position = Isometric.world_to_pixel(where)
  _update_position()

func _set_pixel_position(where: Vector2):
  _pixel_position =                          where
  _world_position = Isometric.pixel_to_world(where)
  _update_position()

func _update_position():
  position = _pixel_position

static func world_to_pixel(where: Vector2) -> Vector2:
  return Vector2(
    (where.x - where.y) * VOLUME_HALF_WIDTH,
    (where.x + where.y) * VOLUME_HALF_DEPTH
  )

static func pixel_to_world(where: Vector2) -> Vector2:
  var x = where.x / VOLUME_HALF_WIDTH
  var y = where.y / VOLUME_HALF_DEPTH
  return Vector2(
    (y + x),
    (y - x)
  )

