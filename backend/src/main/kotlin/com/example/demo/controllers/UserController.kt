package com.example.demo.controllers

import com.example.demo.entities.User
import com.example.demo.repositories.UserRepository
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*

@Controller
@RequestMapping("/user")
class UserController(private val repo : UserRepository) {

    @GetMapping("/all")
    fun getByUsername() : Iterable<User> {
        var v = User()
        return repo.findAll()
    }

}