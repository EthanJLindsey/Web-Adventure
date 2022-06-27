package com.example.demo.controllers

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

@Controller
class HomeController {

    @GetMapping("/")
    fun home() : String {
        return "home"
    }

    @GetMapping("/game")
    fun game() : String {
        return "game"
    }

    @GetMapping("/about")
    fun about() : String {
        return "about"
    }

}