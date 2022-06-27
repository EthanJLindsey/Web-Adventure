package com.example.demo.entities

import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity(name = "Users")
class User {
    @Id
    var username : String = ""
    var password : String = ""
    var role     : String = "USER"
    var status   : Short  = 0
}