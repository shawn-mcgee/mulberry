class_name VillagerData
extends Resource

const HE   = ["he"  , "him" , "his"  , "his"   , "himself"   ]
const SHE  = ["she" , "her" , "her"  , "hers"  , "herself"   ]
const THEY = ["they", "them", "their", "theirs", "themselves"]

@export var fname: String
@export var lname: String
@export var age  : int

@export var pronouns: Array[String] = HE

@export var hunger : int # out of 100
@export var thirst : int # out of 100
@export var fatigue: int # out of 100
@export var boredom: int # out of 100
