package com.example.demo.security

import com.example.demo.entities.User
import com.example.demo.repositories.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.*

@Service
class MyUserDetailService(private val repo: UserRepository) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val user : Optional<User> = repo.findById(username)
        user.orElseThrow {UsernameNotFoundException("Not Found: $username") }
        return MyUserDetails(user.get())
    }

}