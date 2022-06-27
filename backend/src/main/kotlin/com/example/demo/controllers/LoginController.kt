package com.example.demo.controllers

import com.example.demo.entities.User
import com.example.demo.repositories.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.*

@Controller
@RequestMapping("/authenticate")
class LoginController(private val repo : UserRepository) {

    @GetMapping("/login")
    fun login() : String {
        return "login"
    }

    @GetMapping("/sign-up")
    fun signup() : String{
        return "sign-up"
    }

    @PostMapping("/sign-up")
    fun signup(@RequestParam username : String, @RequestParam password : String) : String {
        if (repo.existsById(username)) return "redirect:sign-up?error"
        val u : User = User()
        u.username = username
        u.password = BCryptPasswordEncoder().encode(password)
        repo.save(u)
        return "login"
    }

}