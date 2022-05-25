package com.example.demo

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class DemoController {

    @GetMapping("/user")
    fun getUserByName(@RequestParam(value = "name") name: String?): String? {
        return name
    }


}